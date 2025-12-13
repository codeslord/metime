import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, Hand, Plus, Type, Maximize, Download, FileArchive, FileText, Loader2, Upload } from 'lucide-react';
// TODO: Re-import when re-enabling tools: Square, Pencil
import { ToolButton } from './ToolButton';

export type ToolType = 'select' | 'hand' | 'upload' | 'shapes' | 'text' | 'pencil';

interface LeftToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onToolSubmenuOpen?: (tool: ToolType, position: { x: number; y: number }) => void;
  onFitView?: () => void;
  onExportZip?: () => Promise<void>;
  onExportPdf?: () => Promise<void>;
  onImport?: (file: File) => Promise<void>;
  canExport?: boolean;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  onToolChange,
  onToolSubmenuOpen,
  onFitView,
  onExportZip,
  onExportPdf,
  onImport,
  canExport = false,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportType, setExportType] = useState<'zip' | 'pdf' | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    {
      type: 'select' as ToolType,
      icon: MousePointer2,
      label: 'Select',
      shortcut: 'V',
      hasSubmenu: false,
    },
    {
      type: 'hand' as ToolType,
      icon: Hand,
      label: 'Hand',
      shortcut: 'H',
      hasSubmenu: false,
    },
    {
      type: 'upload' as ToolType,
      icon: Plus,
      label: 'Upload',
      shortcut: 'U',
      hasSubmenu: true,
    },
    // TODO: Temporarily hidden - shapes tool
    // {
    //   type: 'shapes' as ToolType,
    //   icon: Square,
    //   label: 'Shapes',
    //   shortcut: 'S',
    //   hasSubmenu: true,
    // },
    {
      type: 'text' as ToolType,
      icon: Type,
      label: 'Text',
      shortcut: 'T',
      hasSubmenu: false,
    },
    // TODO: Temporarily hidden - pencil tool
    // {
    //   type: 'pencil' as ToolType,
    //   icon: Pencil,
    //   label: 'Pencil',
    //   shortcut: 'P',
    //   hasSubmenu: true,
    // },
  ];

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const handleToolClick = (tool: ToolType, hasSubmenu: boolean, event: React.MouseEvent) => {
    if (hasSubmenu && onToolSubmenuOpen) {
      // For tools with submenus, only open the submenu
      // Don't change the active tool yet
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      onToolSubmenuOpen(tool, {
        x: rect.right + 8,
        y: rect.top,
      });
    } else {
      // For tools without submenus, change the tool immediately
      onToolChange(tool);
    }
  };

  const handleExport = async (type: 'zip' | 'pdf') => {
    setIsExporting(true);
    setExportType(type);
    setShowExportMenu(false);

    try {
      if (type === 'zip' && onExportZip) {
        await onExportZip();
      } else if (type === 'pdf' && onExportPdf) {
        await onExportPdf();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleImportClick = () => {
    setShowExportMenu(false);
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    setIsImporting(true);
    try {
      await onImport(file);
    } catch (error) {
      console.error('Import failed:', error);
      alert(error instanceof Error ? error.message : 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 animate-fade-in-opacity" data-toolbar>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-2">
        <div className="flex flex-col gap-1">
          {tools.map((tool) => (
            <div key={tool.type} onClick={(e) => handleToolClick(tool.type, tool.hasSubmenu, e)}>
              <ToolButton
                icon={tool.icon}
                label={tool.label}
                isActive={activeTool === tool.type}
                onClick={() => { }}
                keyboardShortcut={tool.shortcut}
                hasSubmenu={tool.hasSubmenu}
              />
            </div>
          ))}

          {/* Divider */}
          <div className="h-px bg-slate-700/50 my-1" />

          {/* Fit View Button */}
          <div onClick={onFitView}>
            <ToolButton
              icon={Maximize}
              label="Fit View"
              isActive={false}
              onClick={() => { }}
              keyboardShortcut="0"
            />
          </div>

          {/* Export/Import Button with Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <div
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export/Import Project"
            >
              <ToolButton
                icon={isExporting || isImporting ? Loader2 : Download}
                label={isExporting ? 'Exporting...' : isImporting ? 'Importing...' : 'Export'}
                isActive={showExportMenu}
                onClick={() => { }}
                keyboardShortcut="E"
                hasSubmenu={true}
              />
            </div>

            {/* Export/Import Options Dropdown */}
            {showExportMenu && (
              <div className="absolute left-full ml-2 top-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-2 min-w-[160px] animate-fade-in-opacity">
                {/* Export options - only available when canExport */}
                <button
                  onClick={() => handleExport('zip')}
                  disabled={!canExport}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${canExport
                      ? 'text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-500 cursor-not-allowed'
                    }`}
                  title={canExport ? 'Export as ZIP Archive' : 'Generate a craft first to enable export'}
                >
                  <FileArchive className="w-4 h-4 text-emerald-400" />
                  <span>ZIP Archive</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!canExport}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${canExport
                      ? 'text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-500 cursor-not-allowed'
                    }`}
                  title={canExport ? 'Export as PDF Document' : 'Generate a craft first to enable export'}
                >
                  <FileText className="w-4 h-4 text-red-400" />
                  <span>PDF Document</span>
                </button>

                {/* Divider */}
                <div className="h-px bg-slate-700/50 my-2" />

                {/* Import option - always available */}
                <button
                  onClick={handleImportClick}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Import ZIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportFile}
        className="hidden"
      />
    </div>
  );
};

