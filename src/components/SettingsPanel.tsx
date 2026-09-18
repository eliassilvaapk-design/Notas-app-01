import { useState, useRef, ChangeEvent } from 'react';
import { Download, Upload, Cloud, RefreshCw, Check, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { UserProfile, UserPlan } from '../types';

interface SettingsPanelProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onClearAllAppData: () => void;
  onTriggerTimeTravel: (days: number) => void;
  onResetToDemoData: () => void;
}

export default function SettingsPanel({
  profile,
  onUpdateProfile,
  onExportBackup,
  onImportBackup,
  onClearAllAppData,
  onTriggerTimeTravel,
  onResetToDemoData,
}: SettingsPanelProps) {
  const [syncingProvider, setSyncingProvider] = useState<'google_drive' | 'onedrive' | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Cloud sync setup (simulated auth/connection)
  const handleToggleCloudSync = (provider: 'google_drive' | 'onedrive') => {

    if (profile.backupProvider === provider) {
      // Disconnect
      onUpdateProfile({
        ...profile,
        backupProvider: null,
        backupSyncedAt: undefined,
      });
      setSyncStatus(`Desconectado do ${provider === 'google_drive' ? 'Google Drive' : 'OneDrive'}.`);
      setTimeout(() => setSyncStatus(null), 3500);
      return;
    }

    // Connect flow simulation
    setSyncingProvider(provider);
    setSyncStatus(`Conectando e autorizando conta com ${provider === 'google_drive' ? 'Google Drive' : 'OneDrive'}...`);
    
    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        backupProvider: provider,
        backupSyncedAt: new Date().toISOString(),
      });
      setSyncingProvider(null);
      setSyncStatus(`Sincronização com o ${provider === 'google_drive' ? 'Google Drive' : 'OneDrive'} vinculada e ativa!`);
      setTimeout(() => setSyncStatus(null), 4000);
    }, 2000);
  };

  // Perform manual cloud synchronization trigger
  const handleForceCloudSyncNow = () => {
    if (!profile.backupProvider) return;
    setSyncingProvider(profile.backupProvider);
    setSyncStatus('Enviando dados criptografados para backup na nuvem...');
    
    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        backupSyncedAt: new Date().toISOString(),
      });
      setSyncingProvider(null);
      setSyncStatus('Backup concluído com sucesso!');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1800);
  };

  // Import local backup trigger
  const handleImportFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result as string;
      const success = onImportBackup(contents);
      if (success) {
        alert('Dados importados e restaurados com sucesso!');
        window.location.reload(); // Quick refresh to update state
      } else {
        alert('Falha ao restaurar backup. Verifique se o arquivo JSON está no formato correto.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* 2-Column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sync & Cloud Section */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center space-x-2">
              <Cloud className="w-4.5 h-4.5 text-indigo-500" />
              <span>Sincronização e Backup na Nuvem</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Guarde suas notas e checklists com segurança e restaure-os manualmente de qualquer dispositivo.
            </p>
          </div>

          {/* Sync provider connection buttons */}
          <div className="space-y-3 pt-2">
            {/* Google Drive Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg">
                  <span className="font-extrabold text-sm font-sans">GD</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs">Google Drive</h4>
                  <p className="text-[10px] text-slate-400">Armazenamento pessoal em nuvem</p>
                </div>
              </div>
              <button
                id="sync-google-drive-btn"
                onClick={() => handleToggleCloudSync('google_drive')}
                className={`text-xs py-1.5 px-3.5 rounded-lg font-bold transition-all ${
                  profile.backupProvider === 'google_drive'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {profile.backupProvider === 'google_drive' ? 'Desconectar' : 'Ativar'}
              </button>
            </div>

            {/* Microsoft OneDrive Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-lg">
                  <span className="font-extrabold text-sm font-sans">OD</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs">OneDrive</h4>
                  <p className="text-[10px] text-slate-400">Microsoft cloud integration</p>
                </div>
              </div>
              <button
                id="sync-onedrive-btn"
                onClick={() => handleToggleCloudSync('onedrive')}
                className={`text-xs py-1.5 px-3.5 rounded-lg font-bold transition-all ${
                  profile.backupProvider === 'onedrive'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {profile.backupProvider === 'onedrive' ? 'Desconectar' : 'Ativar'}
              </button>
            </div>
          </div>

          {/* Sync operations, displays if connected */}
          {profile.backupProvider && (
            <div className="mt-3 bg-indigo-50/45 dark:bg-indigo-950/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[11px] text-indigo-900 dark:text-indigo-200">
                    Sincronização de nuvem ativa ({profile.backupProvider === 'google_drive' ? 'Google Drive' : 'OneDrive'})
                  </p>
                  {profile.backupSyncedAt && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Último backup: {new Date(profile.backupSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  id="sync-now-force-btn"
                  disabled={!!syncingProvider}
                  onClick={handleForceCloudSyncNow}
                  className="bg-indigo-100 dark:bg-indigo-950/50 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  title="Sincronizar dados agora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Sync status feed notifications */}
          {syncStatus && (
            <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-500 flex items-center space-x-2">
              <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-indigo-500" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Local Storage Backup & Clean Reset Section */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center space-x-2">
              <Download className="w-4.5 h-4.5 text-indigo-500" />
              <span>Backup Local (Ficheiro JSON)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exporte seus dados locais para um arquivo ou restaure de um arquivo anteriormente salvo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Export local JSON */}
            <button
              id="export-backup-json-btn"
              onClick={onExportBackup}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-900 flex flex-col items-center justify-center text-center space-y-1.5 transition-all text-slate-700 dark:text-slate-300 group"
            >
              <Download className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs">Exportar Dados</span>
              <span className="text-[9px] text-slate-400">Baixar arquivo .json</span>
            </button>

            {/* Import local JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileSelected}
              accept=".json"
              className="hidden"
            />
            <button
              id="import-backup-json-btn"
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-900 flex flex-col items-center justify-center text-center space-y-1.5 transition-all text-slate-700 dark:text-slate-300 group"
            >
              <Upload className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs">Importar Backup</span>
              <span className="text-[9px] text-slate-400">Upload arquivo .json</span>
            </button>
          </div>

          {/* Reset button collection */}
          <div className="border-t border-slate-100 dark:border-slate-900 pt-4 space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Massa de Dados e Reset</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                id="reset-demo-data-btn"
                onClick={onResetToDemoData}
                className="py-2 px-3 text-xs bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition-colors flex-1"
                title="Gera notas demo para você testar"
              >
                Gerar Amostras Demo
              </button>
              
              <button
                id="wipe-app-data-btn"
                onClick={() => {
                  if (confirm('Tem certeza absoluta que deseja esvaziar todos os dados? Esta ação irá deletar todas as notas imediatamente.')) {
                    onClearAllAppData();
                  }
                }}
                className="py-2 px-3 text-xs bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold rounded-lg border border-rose-100 dark:border-rose-900/40 transition-colors flex-1"
              >
                Limpar Banco de Dados
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Guide Column */}
      <div className="bg-indigo-50/40 dark:bg-slate-900/30 border border-indigo-200/50 dark:border-indigo-950 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
          Instruções de Teste de Exclusão e Notificações (Simulador de Tempo)
        </h4>

        <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            No topo ou na aba da lixeira, você encontrará botões de <strong className="text-indigo-600 dark:text-indigo-400">Viagem Temporal (+1 Dia e +7 Dias)</strong>.
          </p>
          <p>
            Como notas de autoexclusão operam por prazos como 1, 7 ou 30 dias, você pode simular o avanço do calendário instantaneamente. Ao usar os botões:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
            <li>As datas de expiração das notas chegam perto: o app dispara avisos de validade de 24h na seção de Notificações.</li>
            <li>Quando o tempo ultrapassa o prazo, o trabalhador de segundo plano intercepta a nota e a move automaticamente para a lixeira.</li>
            <li>Qualquer nota da lixeira que passe de 30 dias será excluída permanentemente de forma silenciosa.</li>
          </ul>
        </div>

        {/* Master Time Travel Row */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tempo Geral:</span>
          <button
            id="settings-time-1d"
            onClick={() => onTriggerTimeTravel(1)}
            className="bg-white dark:bg-slate-800 border border-slate-300 hover:border-indigo-500 hover:scale-[1.02] text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition-all text-slate-700 dark:text-slate-300"
          >
            Avançar +1 Dia
          </button>
          <button
            id="settings-time-7d"
            onClick={() => onTriggerTimeTravel(7)}
            className="bg-indigo-500 hover:bg-indigo-600 hover:scale-[1.02] text-xs font-bold py-1.5 px-4 rounded-lg shadow-md text-white transition-all"
          >
            Avançar +7 Dias
          </button>
        </div>
      </div>
    </div>
  );
}
