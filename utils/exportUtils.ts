/**
 * Export utilities for Crafternia projects
 * Supports ZIP archive and PDF document exports
 */
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

export interface ExportStep {
    stepNumber: number;
    title: string;
    description: string;
    safetyWarning?: string;
    imageUrl?: string;
}

export interface ExportProjectData {
    name: string;
    category: string;
    masterImageUrl: string;
    materials: string[];
    steps: ExportStep[];
    createdAt?: Date;
}

/**
 * Converts a data URL or image URL to a Blob
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
    // Handle data URLs directly
    if (url.startsWith('data:')) {
        const response = await fetch(url);
        return response.blob();
    }

    // Handle regular URLs
    const response = await fetch(url, { mode: 'cors' });
    return response.blob();
}

/**
 * Converts a data URL to base64 string (without prefix)
 */
function dataUrlToBase64(dataUrl: string): string {
    return dataUrl.split(',')[1] || dataUrl;
}

/**
 * Loads an image and returns its dimensions and data URL
 */
async function loadImage(url: string): Promise<{ img: HTMLImageElement; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ img, width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Export project as a ZIP archive
 * Contains: master.png, step-N.png files, materials.txt, instructions.json
 */
export async function exportAsZip(
    project: ExportProjectData,
    onProgress?: (message: string) => void
): Promise<void> {
    const zip = new JSZip();
    const report = onProgress || console.log;

    report('Creating ZIP archive...');

    // Add master image
    if (project.masterImageUrl) {
        report('Adding master image...');
        try {
            const masterBlob = await fetchImageAsBlob(project.masterImageUrl);
            zip.file('master.png', masterBlob);
        } catch (err) {
            console.error('Failed to add master image:', err);
        }
    }

    // Add step images
    for (const step of project.steps) {
        if (step.imageUrl) {
            report(`Adding step ${step.stepNumber} image...`);
            try {
                const stepBlob = await fetchImageAsBlob(step.imageUrl);
                zip.file(`step-${step.stepNumber}.png`, stepBlob);
            } catch (err) {
                console.error(`Failed to add step ${step.stepNumber} image:`, err);
            }
        }
    }

    // Add materials list
    if (project.materials.length > 0) {
        report('Adding materials list...');
        const materialsText = `Materials for: ${project.name}\n` +
            `Category: ${project.category}\n\n` +
            project.materials.map((m, i) => `${i + 1}. ${m}`).join('\n');
        zip.file('materials.txt', materialsText);
    }

    // Add instructions JSON
    report('Adding project metadata...');
    const metadata = {
        name: project.name,
        category: project.category,
        createdAt: project.createdAt?.toISOString() || new Date().toISOString(),
        materials: project.materials,
        steps: project.steps.map(s => ({
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
            safetyWarning: s.safetyWarning,
            hasImage: !!s.imageUrl,
        })),
    };
    zip.file('instructions.json', JSON.stringify(metadata, null, 2));

    // Generate and download
    report('Generating ZIP file...');
    const content = await zip.generateAsync({ type: 'blob' });

    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_crafternia.zip`;
    downloadBlob(content, filename);

    report('Download started!');
}

/**
 * Export project as a PDF document
 * Creates a printable instruction sheet with images and text
 */
export async function exportAsPdf(
    project: ExportProjectData,
    onProgress?: (message: string) => void
): Promise<void> {
    const report = onProgress || console.log;

    report('Creating PDF document...');

    // Create PDF in A4 format
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(project.name, margin, yPos + 8);
    yPos += 15;

    // Category badge
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    pdf.text(`Category: ${project.category}`, margin, yPos);
    pdf.setTextColor(0);
    yPos += 10;

    // Master image
    if (project.masterImageUrl) {
        report('Adding master image to PDF...');
        try {
            const { img, width: imgW, height: imgH } = await loadImage(project.masterImageUrl);

            // Scale to fit content width while maintaining aspect ratio
            const maxImgHeight = 80;
            const scale = Math.min(contentWidth / imgW, maxImgHeight / imgH);
            const displayWidth = imgW * scale;
            const displayHeight = imgH * scale;

            // Center the image
            const imgX = margin + (contentWidth - displayWidth) / 2;

            // Create canvas to get image data
            const canvas = document.createElement('canvas');
            canvas.width = imgW;
            canvas.height = imgH;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                pdf.addImage(dataUrl, 'JPEG', imgX, yPos, displayWidth, displayHeight);
                yPos += displayHeight + 8;
            }
        } catch (err) {
            console.error('Failed to add master image to PDF:', err);
        }
    }

    // Materials section
    if (project.materials.length > 0) {
        report('Adding materials section...');

        // Check if we need a new page
        if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Materials', margin, yPos);
        yPos += 7;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        for (const material of project.materials) {
            if (yPos > pageHeight - 20) {
                pdf.addPage();
                yPos = margin;
            }
            pdf.text(`• ${material}`, margin + 3, yPos);
            yPos += 5;
        }
        yPos += 5;
    }

    // Steps section
    if (project.steps.length > 0) {
        report('Adding step instructions...');

        for (const step of project.steps) {
            // Check if we need a new page
            if (yPos > pageHeight - 70) {
                pdf.addPage();
                yPos = margin;
            }

            // Step header
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Step ${step.stepNumber}: ${step.title}`, margin, yPos);
            yPos += 6;

            // Step image (if available)
            if (step.imageUrl) {
                try {
                    const { img, width: imgW, height: imgH } = await loadImage(step.imageUrl);

                    const maxStepImgWidth = contentWidth * 0.6;
                    const maxStepImgHeight = 50;
                    const scale = Math.min(maxStepImgWidth / imgW, maxStepImgHeight / imgH);
                    const displayWidth = imgW * scale;
                    const displayHeight = imgH * scale;

                    const canvas = document.createElement('canvas');
                    canvas.width = imgW;
                    canvas.height = imgH;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        pdf.addImage(dataUrl, 'JPEG', margin, yPos, displayWidth, displayHeight);
                        yPos += displayHeight + 4;
                    }
                } catch (err) {
                    console.error(`Failed to add step ${step.stepNumber} image:`, err);
                }
            }

            // Step description
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(step.description, contentWidth - 5);
            for (const line of lines) {
                if (yPos > pageHeight - 15) {
                    pdf.addPage();
                    yPos = margin;
                }
                pdf.text(line, margin + 3, yPos);
                yPos += 5;
            }

            // Safety warning
            if (step.safetyWarning) {
                pdf.setTextColor(180, 100, 0);
                pdf.setFont('helvetica', 'italic');
                pdf.text(`⚠ ${step.safetyWarning}`, margin + 3, yPos);
                pdf.setTextColor(0);
                pdf.setFont('helvetica', 'normal');
                yPos += 5;
            }

            yPos += 8;
        }
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Generated with Crafternia • ${new Date().toLocaleDateString()}`, margin, pageHeight - 8);

    // Save
    report('Generating PDF file...');
    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_crafternia.pdf`;
    pdf.save(filename);

    report('Download started!');
}

/**
 * Helper to trigger file download
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
