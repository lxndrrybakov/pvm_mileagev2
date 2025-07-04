import React, { useState, useEffect } from 'react';
import { X, Download, Calendar } from 'lucide-react';
import { db, query } from '../lib/database';

interface Props {
  streamNumber: number;
  onClose: () => void;
}

interface StreamStats {
  totalRuns: number;
  totalRepairs: number;
  averageRunUntilRepair: number;
  repairHistory: {
    pvmNumber: string;
    runDistance: number;
    date: string;
  }[];
  streamRuns: {
    date: string;
    pvmNumber: string;
    runDistance: number;
    isRepair: boolean;
  }[];
}

export default function StreamStatsModal({ streamNumber, onClose }: Props) {
  const [stats, setStats] = useState<StreamStats>({
    totalRuns: 0,
    totalRepairs: 0,
    averageRunUntilRepair: 0,
    repairHistory: [],
    streamRuns: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadStreamStats();
  }, [streamNumber, dateRange]);

  async function loadStreamStats() {
    setLoading(true);
    try {
      // Get stream ID first
      const { data: streams } = await db.getStreams();
      const streamData = streams?.find(s => s.number === streamNumber);

      if (!streamData) {
        throw new Error('Stream not found');
      }

      let sqlQuery = 'SELECT pr.*, p.number as pvm_number FROM pvm_runs pr JOIN pvms p ON pr.pvm_id = p.id WHERE stream_id = $1';

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
      const { data: runs, error } = await query(sqlQuery, [streamData.id]);

      if (error) throw error;

      const repairHistory = runs
        ?.filter(run => run.is_repair_record)
        .map(run => ({
          pvmNumber: run.pvm_number,
          runDistance: run.run_distance,
          date: run.created_at
        })) || [];

      const streamRuns = runs?.map(run => ({
        date: run.created_at,
        pvmNumber: run.pvm_number,
        runDistance: run.run_distance,
        isRepair: run.is_repair_record
      })) || [];

      const totalRepairs = repairHistory.length;
      const totalRunDistance = repairHistory.reduce((sum, record) => sum + record.runDistance, 0);
      const averageRunUntilRepair = totalRepairs > 0 ? totalRunDistance / totalRepairs : 0;

      setStats({
        totalRuns: runs?.length || 0,
        totalRepairs,
        averageRunUntilRepair,
        repairHistory,
        streamRuns
      });
    } catch (error) {
      console.error('Error loading stream stats:', error);
      alert('Ошибка при загрузке статистики ручья');
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = () => {
    const csvContent = [
      ['Дата', 'ПВМ №', 'Тип', 'Пробег'],
      ...stats.streamRuns.map(run => [
        new Date(run.date).toLocaleString('ru-RU'),
        run.pvmNumber,
        run.isRepair ? 'Ремонт' : 'Пробег',
        run.runDistance.toFixed(2)
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stream_${streamNumber}_stats_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Статистика ручья №{streamNumber}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-4">
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
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900">Всего записей</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalRuns}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900">Количество ремонтов</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.totalRepairs}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900">Средний пробег до ремонта</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.averageRunUntilRepair.toFixed(2)} тонн
                </p>
              </div>
            </div>

            {/* Repair History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold">История ремонтов</h3>
              </div>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Дата</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ПВМ №</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Пробег до ремонта</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.repairHistory.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(record.date).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{record.pvmNumber}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {record.runDistance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {stats.repairHistory.length === 0 && (
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

            {/* All Runs */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold">Все записи</h3>
              </div>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Дата</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ПВМ №</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Тип</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Пробег</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.streamRuns.map((run, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(run.date).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{run.pvmNumber}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {run.isRepair ? (
                            <span className="text-red-600">Ремонт</span>
                          ) : (
                            <span className="text-green-600">Пробег</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {run.runDistance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {stats.streamRuns.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Нет записей
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <footer className="bg-gray-900 text-white py-3 px-4 text-center text-sm">
          Разработано Рыбаковым Александром. Отдел операционных улучшений. V 2.0 - 2025
        </footer>
      </div>
    </div>
  );
}