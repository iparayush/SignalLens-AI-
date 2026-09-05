import React, { useState } from 'react';
import { NavigationTab, SignalProfile, ModulationType } from './types';
import { SAMPLE_SIGNALS } from './data/signals';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { UploadSignalView } from './components/UploadSignalView';
import { SignalAnalysisView } from './components/SignalAnalysisView';
import { DetectionResultsView } from './components/DetectionResultsView';
import { DemodulationView } from './components/DemodulationView';
import { DecodePipelineView } from './components/DecodePipelineView';
import { DecodeView } from './components/DecodeView';
import { BitStreamView } from './components/BitStreamView';
import { CorrelationView } from './components/CorrelationView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ExportReportModal } from './components/ExportReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [signalsList, setSignalsList] = useState<SignalProfile[]>(SAMPLE_SIGNALS);
  const [activeSignal, setActiveSignal] = useState<SignalProfile>(SAMPLE_SIGNALS[0]);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleUpdateModulation = (mod: ModulationType) => {
    setActiveSignal((prev) => ({
      ...prev,
      telemetry: {
        ...prev.telemetry,
        modulation: mod,
      },
    }));
  };

  // File upload processor that handles raw files and creates an active SignalProfile
  const handleFileUpload = (file: File) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toUpperCase()}` : '.IQ';
    const computedCrc = '0x' + Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();

    const newSignal: SignalProfile = {
      ...SAMPLE_SIGNALS[0],
      id: `custom-${Date.now()}`,
      filename: file.name,
      fileFormat: extension,
      fileSizeBytes: file.size,
      sizeFormatted: `${sizeMb} MB`,
      crc32: computedCrc,
      durFormatted: `${(Math.max(1, file.size / (2.4 * 1024 * 1024 * 2))).toFixed(1)} s`,
      emitterProfile: {
        ...SAMPLE_SIGNALS[0].emitterProfile,
        callsign: `USER-INGEST-${file.name.slice(0, 8).toUpperCase()}`,
        targetDesignation: `TARGET-${file.name.replace(/\.[^/.]+$/, '').toUpperCase()}`,
      },
    };

    setSignalsList((prev) => [newSignal, ...prev]);
    setActiveSignal(newSignal);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0e18] text-[#dfe2f1] font-body flex">
      {/* Fixed Left Tactical Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Operating Surface */}
      <div className="pl-72 flex flex-col flex-1 min-h-screen w-full">
        {/* Fixed Top Status & Command Header */}
        <Header
          activeSignal={activeSignal}
          signalsList={signalsList}
          onSelectSignal={setActiveSignal}
          onOpenExportModal={() => setExportModalOpen(true)}
        />

        {/* Scrollable Center Mission Surface */}
        <main className="flex-1 pt-20 pb-16 w-full bg-[#0f131d] px-4 min-h-screen">
          {activeTab === 'dashboard' && (
            <DashboardView
              activeSignal={activeSignal}
              onFileUpload={handleFileUpload}
            />
          )}

          {activeTab === 'upload-signal' && (
            <UploadSignalView
              activeSignal={activeSignal}
              signalsList={signalsList}
              onSelectSignal={setActiveSignal}
              onFileUpload={handleFileUpload}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'signal-analysis' && (
            <SignalAnalysisView activeSignal={activeSignal} />
          )}

          {activeTab === 'detection-results' && (
            <DetectionResultsView activeSignal={activeSignal} />
          )}

          {activeTab === 'demodulation' && (
            <DemodulationView
              activeSignal={activeSignal}
              onUpdateModulation={handleUpdateModulation}
            />
          )}

          {(activeTab === 'decode-pipeline' || activeTab === 'decode') && (
            <DecodePipelineView activeSignal={activeSignal} />
          )}

          {activeTab === 'bit-stream' && (
            <BitStreamView activeSignal={activeSignal} />
          )}

          {activeTab === 'correlation' && (
            <CorrelationView activeSignal={activeSignal} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              activeSignal={activeSignal}
              onOpenExportModal={() => setExportModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Fixed Bottom Operations Status Ribbon */}
        <Footer />
      </div>

      {/* Export Intelligence Report Modal Dialog */}
      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        activeSignal={activeSignal}
      />
    </div>
  );
}
