import React from 'react';
import { X, Download, Trash2, Lock } from 'lucide-react';
import { db } from '../lib/database';

interface Props {
  onClose: () => void;
}

interface DeleteOptions {
  showPassword: boolean;
  password: string;
  period?: 'day' | 'week' | 'month' | 'year' | 'all' | 'selected';
  selectedIds?: string[];
}

export default function StatsModal({ onClose }: Props) {
  const [runs, setRuns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteOptions, setDeleteOptions] = React.useState<DeleteOptions>({
    showPassword: false,
    password: '',
    period: undefined,
    selectedIds: []
  });

  React.useEffect(() => {
    loadStats();
  }, []);
  
  async function loadStats() {
    setLoading(true);
    const { data, error } = await db.getPVMRuns();

    if (error) {
      console.error('Error loading stats:', error);
      alert('Ошибка при загрузке статистики');
      setLoading(false);
      return;
    }

    setRuns(data || []);
    setLoading(false);
  }

  const handleDelete = async () => {
    if (deleteOptions.password !== '447386') {
      alert('Неверный пароль');
      return;
    }

    const { error } = await db.deletePVMRuns(deleteOptions.period);
    
    if (error) {
      alert('Ошибка при удалении');
      return;
    }

    setDeleteOptions({ showPassword: false, password: '', period: undefined });
    loadStats();
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Дата', 'ПВМ №', 'Размер заготовки', 'Количество', 'Тех. брак', 'Пробег'],
      ...runs.map(run => [
        new Date(run.created_at).toLocaleString(),
        run.pvms.number,
        run.blank_size,
        run.num_blanks,
        run.tech_scrap,
        run.run_distance
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pvm_stats.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Статистика ПВМ</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Пробеги за плавку</h3>
            <p className="text-sm text-gray-600">
              Все записи пробегов по каждому ПВМ
            </p>
          </div>
          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Пробеги до ремонта</h3>
            <p className="text-sm text-gray-600">
              Итоговые пробеги при отправке в ремонт
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            Экспорт в Excel
          </button>
          <button
            onClick={() => setDeleteOptions({ ...deleteOptions, showPassword: true })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Очистить данные
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-6 min-h-[400px]">
            {/* Regular runs table */}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Дата</th>
                  <th className="px-4 py-2 text-left font-medium">ПВМ №</th>
                  <th className="px-4 py-2 text-left font-medium">Размер</th>
                  <th className="px-4 py-2 text-left font-medium">Кол-во</th>
                  <th className="px-4 py-2 text-left font-medium">Тех.брак</th>
                  <th className="px-4 py-2 text-left font-medium">Пробег</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.filter(run => !run.is_repair_record).map(run => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(run.created_at).toLocaleString('ru-RU')}</td>
                    <td className="px-4 py-2">{run.pvms.number}</td>
                    <td className="px-4 py-2">{run.blank_size}</td>
                    <td className="px-4 py-2">{run.num_blanks}</td>
                    <td className="px-4 py-2">{run.tech_scrap}</td>
                    <td className="px-4 py-2">{run.run_distance.toFixed(2)}</td>
                  </tr>
                ))}
                {runs.filter(run => !run.is_repair_record).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Нет записей о пробегах
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Repair runs table */}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Дата</th>
                  <th className="px-4 py-2 text-left font-medium">ПВМ №</th>
                  <th className="px-4 py-2 text-left font-medium">Пробег до ремонта</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.filter(run => run.is_repair_record).map(run => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(run.created_at).toLocaleString('ru-RU')}</td>
                    <td className="px-4 py-2">{run.pvms.number}</td>
                    <td className="px-4 py-2">{run.run_distance.toFixed(2)}</td>
                  </tr>
                ))}
                {runs.filter(run => run.is_repair_record).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Нет записей о ремонтах
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {deleteOptions.showPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Удаление данных</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Период удаления
                  </label>
                  <select
                    value={deleteOptions.period || ''}
                    onChange={(e) => setDeleteOptions({
                      ...deleteOptions,
                      period: e.target.value as DeleteOptions['period']
                    })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Выберите период</option>
                    <option value="day">За день</option>
                    <option value="week">За неделю</option>
                    <option value="month">За месяц</option>
                    <option value="year">За год</option>
                    <option value="all">Все данные</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={deleteOptions.password}
                    onChange={(e) => setDeleteOptions({
                      ...deleteOptions,
                      password: e.target.value
                    })}
                    placeholder="Введите пароль"
                    className="w-full border rounded-lg p-2 pr-10"
                  />
                  <Lock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteOptions({
                      showPassword: false,
                      password: '',
                      period: undefined
                    })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!deleteOptions.period || !deleteOptions.password}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}