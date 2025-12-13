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

// Serializable node structure for export/import
export interface SerializableNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
}

// Serializable edge structure for export/import
export interface SerializableEdge {
    id: string;
    source: string;
    sourceHandle?: string;
    target: string;
    targetHandle?: string;
    animated?: boolean;
    style?: Record<string, unknown>;
}

// Full canvas state for restoration
export interface CanvasState {
    nodes: SerializableNode[];
    edges: SerializableEdge[];
    viewport?: { x: number; y: number; zoom: number };
}

export interface ExportProjectData {
    name: string;
    category: string;
    masterImageUrl: string;
    materials: string[];
    steps: ExportStep[];
    createdAt?: Date;
    // Optional canvas state for full project restoration
    canvasState?: CanvasState;
}

// Result from importing a ZIP file
export interface ImportedProjectData {
    name: string;
    category: string;
    materials: string[];
    steps: ExportStep[];
    canvasState: CanvasState;
    createdAt?: string;
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
 * Contains: master.png, step-N.png files, materials.txt, instructions.json, crafternia-project.json
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

    // Add instructions JSON (legacy format for human readability)
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

    // Add full project state for import/restoration
    report('Adding canvas state for import...');
    const projectState = {
        version: '1.0',
        name: project.name,
        category: project.category,
        createdAt: project.createdAt?.toISOString() || new Date().toISOString(),
        materials: project.materials,
        steps: project.steps.map(s => ({
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
            safetyWarning: s.safetyWarning,
            // Reference to the image file in the ZIP
            imageFile: s.imageUrl ? `step-${s.stepNumber}.png` : null,
        })),
        // Include canvas state if provided
        canvasState: project.canvasState || null,
    };
    zip.file('crafternia-project.json', JSON.stringify(projectState, null, 2));

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

/**
 * Convert a Blob to a data URL
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Import a Crafternia project from a ZIP file
 * Returns the parsed project data with images as data URLs
 */
export async function importFromZip(
    file: File,
    onProgress?: (message: string) => void
): Promise<ImportedProjectData> {
    const report = onProgress || console.log;

    report('Reading ZIP file...');
    const zip = await JSZip.loadAsync(file);

    // Check for project file (new format with canvas state)
    let projectJson = zip.file('crafternia-project.json');
    let projectData: {
        version?: string;
        name: string;
        category: string;
        createdAt?: string;
        materials: string[];
        steps: {
            stepNumber: number;
            title: string;
            description: string;
            safetyWarning?: string;
            imageFile?: string | null;
            hasImage?: boolean;
        }[];
        canvasState?: CanvasState | null;
    } | null = null;

    if (projectJson) {
        report('Found project file...');
        const content = await projectJson.async('text');
        projectData = JSON.parse(content);
    } else {
        // Fallback to legacy instructions.json
        const instructionsJson = zip.file('instructions.json');
        if (!instructionsJson) {
            throw new Error('Invalid ZIP file: no project data found');
        }
        report('Using legacy format...');
        const content = await instructionsJson.async('text');
        projectData = JSON.parse(content);
    }

    if (!projectData) {
        throw new Error('Failed to parse project data');
    }

    report('Loading master image...');
    // Load master image
    let masterImageUrl = '';
    const masterFile = zip.file('master.png');
    if (masterFile) {
        const masterBlob = await masterFile.async('blob');
        masterImageUrl = await blobToDataUrl(masterBlob);
    }

    report('Loading step images...');
    // Load step images
    const steps: ExportStep[] = [];
    for (const step of projectData.steps) {
        let imageUrl: string | undefined = undefined;

        // Try to load image from ZIP
        const imageFileName = step.imageFile || `step-${step.stepNumber}.png`;
        const imageFile = zip.file(imageFileName);
        if (imageFile) {
            try {
                const imageBlob = await imageFile.async('blob');
                imageUrl = await blobToDataUrl(imageBlob);
            } catch (err) {
                console.error(`Failed to load step ${step.stepNumber} image:`, err);
            }
        }

        steps.push({
            stepNumber: step.stepNumber,
            title: step.title,
            description: step.description,
            safetyWarning: step.safetyWarning,
            imageUrl,
        });
    }

    report('Reconstructing canvas state...');
    // Build or restore canvas state
    let canvasState: CanvasState;

    if (projectData.canvasState) {
        // Restore saved canvas state, updating image URLs
        canvasState = { ...projectData.canvasState };

        // Update image URLs in nodes
        canvasState.nodes = canvasState.nodes.map(node => {
            if (node.type === 'masterNode' && masterImageUrl) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        imageUrl: masterImageUrl,
                    },
                };
            }
            if (node.type === 'instructionNode') {
                const stepNumber = node.data.stepNumber as number;
                const step = steps.find(s => s.stepNumber === stepNumber);
                if (step?.imageUrl) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            imageUrl: step.imageUrl,
                        },
                    };
                }
            }
            return node;
        });
    } else {
        // Generate canvas state from steps (for legacy imports)
        const masterNodeId = `master-imported-${Date.now()}`;
        const nodes: SerializableNode[] = [];
        const edges: SerializableEdge[] = [];

        // Create master node
        nodes.push({
            id: masterNodeId,
            type: 'masterNode',
            position: { x: 0, y: 0 },
            data: {
                label: projectData.name,
                imageUrl: masterImageUrl,
                category: projectData.category,
                isDissecting: false,
                isDissected: steps.length > 0,
            },
        });

        // Create material node if we have materials
        if (projectData.materials.length > 0) {
            const matNodeId = `${masterNodeId}-mat`;
            nodes.push({
                id: matNodeId,
                type: 'materialNode',
                position: { x: -400, y: 0 },
                data: { items: projectData.materials },
            });
            edges.push({
                id: `e-${masterNodeId}-${matNodeId}`,
                source: masterNodeId,
                sourceHandle: 'source-left',
                target: matNodeId,
                targetHandle: 'target-right',
                animated: true,
                style: { stroke: '#3b82f6', strokeWidth: 2 },
            });
        }

        // Create step nodes in a 2-column grid
        const gapX = 400;
        const gapY = 500;
        const startX = 500;
        const startY = -((Math.ceil(steps.length / 2) - 1) * gapY) / 2;

        steps.forEach((step, index) => {
            const stepNodeId = `${masterNodeId}-step-${step.stepNumber}`;
            const col = index % 2;
            const row = Math.floor(index / 2);

            nodes.push({
                id: stepNodeId,
                type: 'instructionNode',
                position: {
                    x: startX + (col * gapX),
                    y: startY + (row * gapY),
                },
                data: {
                    stepNumber: step.stepNumber,
                    title: step.title,
                    description: step.description,
                    safetyWarning: step.safetyWarning,
                    imageUrl: step.imageUrl,
                    isGeneratingImage: false,
                },
            });

            edges.push({
                id: `e-${masterNodeId}-${stepNodeId}`,
                source: masterNodeId,
                sourceHandle: 'source-right',
                target: stepNodeId,
                targetHandle: 'target-left',
                animated: true,
                style: { stroke: '#10b981', strokeWidth: 2 },
            });
        });

        canvasState = { nodes, edges };
    }

    report('Import complete!');

    return {
        name: projectData.name,
        category: projectData.category,
        materials: projectData.materials,
        steps,
        canvasState,
        createdAt: projectData.createdAt,
    };
}
