import { useRef, ChangeEvent } from 'react';
import { Download, Upload, Database, RotateCcw, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

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
  onExportBackup,
  onImportBackup,
  onClearAllAppData,
  onTriggerTimeTravel,
  onResetToDemoData,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      {/* 2-Column layout for Backup and Data Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Local Storage Backup Section */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center space-x-2">
              <Download className="w-4.5 h-4.5 text-indigo-500" />
              <span>Backup Local (Ficheiro JSON)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exporte suas notas e configurações para um arquivo local ou restaure de um backup previamente salvo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Export local JSON */}
            <button
              id="export-backup-json-btn"
              onClick={onExportBackup}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-900 flex flex-col items-center justify-center text-center space-y-1.5 transition-all text-slate-700 dark:text-slate-300 group hover:bg-slate-50 dark:hover:bg-slate-900/50"
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
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-900 flex flex-col items-center justify-center text-center space-y-1.5 transition-all text-slate-700 dark:text-slate-300 group hover:bg-slate-50 dark:hover:bg-slate-900/50"
            >
              <Upload className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs">Importar Backup</span>
              <span className="text-[9px] text-slate-400">Upload arquivo .json</span>
            </button>
          </div>
        </div>

        {/* Data & Database Reset Section */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center space-x-2">
              <Database className="w-4.5 h-4.5 text-indigo-500" />
              <span>Gerenciamento de Dados</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Restabeleça notas de demonstração ou apague completamente as informações armazenadas no seu navegador.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              id="reset-demo-data-btn"
              onClick={onResetToDemoData}
              className="w-full py-2.5 px-3 text-xs bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center space-x-2"
              title="Gera notas demo para você testar"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Notas Demonstrativas</span>
            </button>
            
            <button
              id="wipe-app-data-btn"
              onClick={() => {
                if (confirm('Tem certeza absoluta que deseja esvaziar todos os dados? Esta ação irá deletar todas as notas imediatamente.')) {
                  onClearAllAppData();
                }
              }}
              className="w-full py-2.5 px-3 text-xs bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-900/40 transition-colors flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Limpar Todos os Dados</span>
            </button>
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
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:scale-[1.02] text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition-all text-slate-700 dark:text-slate-300"
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
