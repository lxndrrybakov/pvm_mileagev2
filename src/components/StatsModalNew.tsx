import React, { useState } from 'react';
import { X, Download, Filter, Calendar, Trash2, Lock } from 'lucide-react';
import { db, query } from '../lib/database';
import StreamStatsModal from './StreamStatsModal';

interface Props {
  onClose: () => void;
}

interface Stats {
  regularRuns: any[];
  repairRuns: any[];
  selectedStreamRuns: any[];
  streamStats: {
    id: string;
    number: number;
    total_run: number;
    average_run: number;
  }[];
  totalRuns: number;
  totalRepairs: number;
  averageRunUntilRepair: number;
}

export default function StatsModalNew({ onClose }: Props) {
  const [stats, setStats] = React.useState<Stats>({
    regularRuns: [],
    repairRuns: [],
    selectedStreamRuns: [],
    streamStats: [],
    totalRuns: 0,
    totalRepairs: 0,
    averageRunUntilRepair: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [selectedPvm, setSelectedPvm] = React.useState<string>('all');
  const [selectedStreamNumber, setSelectedStreamNumber] = useState<number | null>(null);
  const [dateRange, setDateRange] = React.useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePeriod, setDeletePeriod] = useState<'day' | 'week' | 'month' | 'all' | ''>('');

  const handleDelete = async () => {
    if (deletePassword !== '447386') {
      alert('Неверный пароль');
      return;
    }

    if (!deletePeriod) {
      alert('Выберите период для удаления');
      return;
    }

    try {
      const { error } = await db.deletePVMRuns(deletePeriod);

      if (error) {
        throw error;
      }

      alert('Данные успешно удалены');
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeletePeriod('');
      loadStats();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Ошибка при удалении данных. Пожалуйста, попробуйте еще раз.');
    }
  };

  React.useEffect(() => {
    loadStats();
  }, [selectedPvm, dateRange]);

  async function loadStats() {
    setLoading(true);
    let streamData;
    
    try {
      // Load stream statistics first
      const { data: streamsResponse } = await db.getStreams();
      const { data: runsData } = await db.getPVMRuns();
      const { data: assignmentsData } = await query(
        'SELECT * FROM stream_assignments ORDER BY assigned_at'
      );
      
      streamData = streamsResponse;

      let sqlQuery = 'SELECT * FROM pvm_runs WHERE 1=1';

      // Apply date filter
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        sqlQuery += ` AND created_at >= '${startDate.toISOString()}'`;
      }

      sqlQuery += ' ORDER BY created_at DESC';
      const { data, error } = await query(sqlQuery);

      if (error) throw error;

      const filteredData = selectedPvm === 'all' 
        ? data 
        : data.filter(run => run.pvm_number === selectedPvm);
      
      const regularRuns = filteredData.filter(run => !run.is_repair_record);
      const repairRuns = filteredData.filter(run => run.is_repair_record);
      
      // Calculate average run distance until repair
      const totalRunUntilRepair = repairRuns.reduce((sum, run) => sum + run.run_distance, 0);
      const averageRunUntilRepair = repairRuns.length > 0 ? totalRunUntilRepair / repairRuns.length : 0;

      const streamStats = streamData?.map(stream => ({
        id: stream.id,
        number: stream.number,
        total_run: stream.total_run || 0,
        average_run: 0,
        run_count: 0
      })) || [];

      setStats({
        regularRuns,
        repairRuns,
        streamStats,
        selectedStreamRuns: [],
        totalRuns: regularRuns.length,
        totalRepairs: repairRuns.length,
        averageRunUntilRepair
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      alert('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = () => {
    const allRuns = [...stats.regularRuns, ...stats.repairRuns];
    const csvContent = [
      ['Тип', 'Дата', 'ПВМ №', 'Размер', 'Количество', 'Тех. брак', 'Пробег'],
      ...allRuns.map(run => [
        run.is_repair_record ? 'Ремонт' : 'Пробег',
        new Date(run.created_at).toLocaleString('ru-RU'),
        run.pvm_number,
        run.blank_size,
        run.num_blanks || '-',
        run.tech_scrap || '-',
        run.run_distance.toFixed(2)
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pvm_stats_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Статистика ПВМ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedPvm}
              onChange={(e) => setSelectedPvm(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-900"
            >
              <option value="all">Все ПВМ</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  ПВМ №{i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border rounded-lg px-3 py-2 text-gray-900"
            >
              <option value="all">Все время</option>
              <option value="today">Сегодня</option>
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
            </select>
          </div>
          <button
            onClick={exportToExcel}
            className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Экспорт
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Удалить данные
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900">Всего записей пробегов</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalRuns}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900">Всего ремонтов</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.totalRepairs}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900">Средний пробег до ремонта</h3>
              <p className="text-3xl font-bold text-green-600">{stats.averageRunUntilRepair.toFixed(2)} тонн</p>
            </div>
          </div>

          {/* Regular Runs Table */}
          <div className="col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold">Пробеги за плавку</h3>
              </div>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Дата</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ПВМ №</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Размер</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Кол-во</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Обрезь</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Пробег</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.regularRuns.map(run => (
                      <tr key={run.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{new Date(run.created_at).toLocaleString('ru-RU')}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{run.pvm_number}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{run.blank_size}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{run.num_blanks}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{run.tech_scrap}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{run.run_distance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Repair Records Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold">Записи о ремонтах</h3>
              </div>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Дата</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ПВМ №</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Пробег до ремонта</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.repairRuns.map(run => (
                      <tr key={run.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{new Date(run.created_at).toLocaleString('ru-RU')}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{run.pvm_number}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{run.run_distance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stream Statistics */}
          <div className="col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h3 className="font-semibold">Статистика по ручьям</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-4">
                {stats.streamStats.map(stream => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStreamNumber(stream.number)}
                    className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left"
                  >
                    <h4 className="text-lg font-semibold text-blue-900">Ручей №{stream.number}</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-blue-700">
                        Общий пробег: <span className="font-medium">{stream.total_run.toFixed(2)}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      {selectedStreamNumber && (
        <StreamStatsModal
          streamNumber={selectedStreamNumber}
          onClose={() => setSelectedStreamNumber(null)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Удаление данных</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Период удаления
                </label>
                <select
                  value={deletePeriod}
                  onChange={(e) => setDeletePeriod(e.target.value as any)}
                  className="w-full border rounded-lg p-2 text-gray-900"
                >
                  <option value="">Выберите период</option>
                  <option value="day">За день</option>
                  <option value="week">За неделю</option>
                  <option value="month">За месяц</option>
                  <option value="all">Все данные</option>
                </select>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full border rounded-lg p-2 pr-10 text-gray-900"
                />
                <Lock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeletePeriod('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!deletePeriod || !deletePassword}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        <footer className="bg-gray-900 text-white py-3 px-4 text-center text-sm">
          Разработано Рыбаковым Александром. Отдел операционных улучшений. V 2.0 - 2025
        </footer>
        </div>
      )}
    </div>
  );
}