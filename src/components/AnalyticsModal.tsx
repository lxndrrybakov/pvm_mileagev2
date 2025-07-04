import React, { useState, useEffect } from 'react';
import { X, Brain } from 'lucide-react';
import { db, query } from '../lib/database';
import * as tf from '@tensorflow/tfjs/dist/tf';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  onClose: () => void;
}

interface StreamAnalysis {
  streamNumber: number;
  averageRunUntilRepair: number;
  predictedLifespan: number;
  reliability: number;
  totalRuns: number;
}

export default function AnalyticsModal({ onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<StreamAnalysis[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('all');
  const [streamData, setStreamData] = useState<any[]>([]);

  useEffect(() => {
    analyzeData();
  }, []);

  async function analyzeData() {
    setLoading(true);
    try {
      // Get streams and their related data
      const { data: streamsResponse } = await db.getStreams();
      const { data: runsData } = await db.getPVMRuns();
      const { data: assignmentsData } = await query(
        'SELECT * FROM stream_assignments ORDER BY assigned_at'
      );
      
      setStreamData(streamsResponse || []);

      let sqlQuery = 'SELECT * FROM pvm_runs WHERE 1=1';

      // Apply date filter
      if (dateRange !== 'all') {
        const startDate = new Date();
        
        switch (dateRange) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
        
        sqlQuery += ` AND created_at >= '${startDate.toISOString()}'`;
      }

      sqlQuery += ' ORDER BY created_at DESC';
      const { data, error } = await query(sqlQuery);

      if (error) throw error;

      // Process data for each stream
      const streamAnalysis = await Promise.all((streamsResponse || []).map(async (stream) => {
        // Get repair records for this stream
        const streamRepairs = (runsData || [])
          .filter(run => run.stream_id === stream.id && run.is_repair_record);
        
        // Get run distances until repair for this stream
        const runDistances = streamRepairs.map(repair => repair.run_distance);
        
        // Calculate average run until repair
        const averageRun = runDistances.length > 0 
          ? runDistances.reduce((a, b) => a + b, 0) / runDistances.length 
          : 0;

        // Use TensorFlow to predict future performance
        let predictedLifespan = averageRun;
        let reliability = 1.0;

        if (runDistances.length > 0) {
          // Convert data to tensors
          const xs = tf.tensor1d(Array.from({ length: runDistances.length }, (_, i) => i));
          const ys = tf.tensor1d(runDistances);

          // Create and train a simple linear regression model
          const model = tf.sequential();
          model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
          
          await model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
          await model.fit(xs, ys, { epochs: 100, verbose: 0 });

          // Make prediction for next repair
          const prediction = model.predict(tf.tensor2d([[runDistances.length]])) as tf.Tensor;
          predictedLifespan = (await prediction.data())[0];

          // Calculate reliability score (0-1) based on consistency of repair intervals
          const std = tf.moments(ys).variance.sqrt().dataSync()[0];
          reliability = Math.max(0, Math.min(1, 1 - (std / averageRun)));

          // Cleanup
          model.dispose();
          xs.dispose();
          ys.dispose();
          prediction.dispose();
        }

        return {
          streamNumber: stream.number,
          averageRunUntilRepair: averageRun,
          predictedLifespan,
          reliability,
          totalRuns: streamRepairs.length
        };
      }));

      setAnalysis(streamAnalysis);

      // Prepare chart data
      const chartData = {
        labels: streamAnalysis.map(a => `Ручей ${a.streamNumber}`),
        datasets: [
          {
            label: 'Средний пробег до ремонта',
            data: streamAnalysis.map(a => a.averageRunUntilRepair),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Прогноз следующего ремонта',
            data: streamAnalysis.map(a => a.predictedLifespan),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      };

      setChartData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Error in analytics:', error);
      alert('Ошибка при анализе данных');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Анализ данных ПВМ</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Анализ по ручьям</h3>
                  {chartData && (
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: 'Пробеги и прогнозы по ручьям'
                          }
                        }
                      }}
                    />
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Рекомендации</h3>
                  <div className="space-y-4">
                    {analysis.map((stream) => {
                      const reliabilityClass = 
                        stream.reliability > 0.7 ? 'text-green-700' :
                        stream.reliability > 0.4 ? 'text-yellow-700' :
                        'text-red-700';

                      return (
                        <div key={stream.streamNumber} className="border-b pb-4">
                          <h4 className="font-medium text-gray-900">Ручей №{stream.streamNumber}</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-900">
                            <p className="text-gray-900">Средний пробег до ремонта: {stream.averageRunUntilRepair.toFixed(2)} тонн</p>
                            <p className="text-gray-900">Прогноз следующего ремонта: {stream.predictedLifespan.toFixed(2)} тонн</p>
                            <p className={reliabilityClass}>
                              Надежность: {(stream.reliability * 100).toFixed(1)}%
                            </p>
                            <p className="text-gray-900 mt-2">
                              {stream.reliability > 0.7 
                                ? 'Ручей показывает стабильную работу'
                                : stream.reliability > 0.4
                                ? 'Требуется внимание к состоянию ручья'
                                : 'Рекомендуется проверка и обслуживание ручья'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Общие выводы</h3>
                <div className="space-y-2">
                  {analysis.length > 0 && (
                    <>
                      <p className="text-gray-900">
                        Наиболее стабильный ручей: №
                        {analysis.reduce((a, b) => a.reliability > b.reliability ? a : b).streamNumber}
                      </p>
                      <p className="text-gray-900">
                        Ручей с наибольшим средним пробегом: №
                        {analysis.reduce((a, b) => a.averageRunUntilRepair > b.averageRunUntilRepair ? a : b).streamNumber}
                      </p>
                      <p className="text-gray-900">
                        Рекомендуемый порядок проверки ручьев:
                        {analysis
                          .sort((a, b) => a.reliability - b.reliability)
                          .map(a => ` №${a.streamNumber}`)
                          .join(', ')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <footer className="bg-gray-900 text-white py-3 px-4 text-center text-sm">
          Разработано Рыбаковым Александром. Отдел операционных улучшений. V 2.0 - 2025
        </footer>
      </div>
    </div>
  );
}