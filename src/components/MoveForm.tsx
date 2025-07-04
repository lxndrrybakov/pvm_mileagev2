import React, { useEffect, useState } from 'react';
import type { PVM, Stream } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '../lib/database';

const STREAM_NUMBERS = [1, 2, 3, 4, 5, 6];

interface Props {
  pvm: PVM;
  onMove: (newStatus: PVM['status']) => void;
  onClose: () => void;
}

export default function MoveForm({ pvm, onMove, onClose }: Props) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStreamNumber, setSelectedStreamNumber] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStreams();
  }, []);

  async function loadStreams() {
    setLoading(true);
    
    const { data, error } = await db.getStreams();
    
    if (error) {
      alert('Ошибка при загрузке ручьев. Пожалуйста, обновите страницу.');
      setLoading(false);
      return;
    }

    if (data && data.length === 6) {
      setStreams(data);
    } else {
      alert('Ошибка: не все ручьи инициализированы. Пожалуйста, обратитесь к администратору.');
    }
    setLoading(false);
  }

  const handleMove = async (newStatus: PVM['status']) => {
    if (newStatus === 'inWork' && !selectedStreamNumber) {
      alert('Пожалуйста, выберите ручей');
      return;
    }

    if (newStatus === 'inWork') {
      // Check if stream already has a PVM
      const { data: existingPvm } = await query(
        'SELECT id, number FROM pvms WHERE stream_id = $1',
        [streams.find(s => s.number === selectedStreamNumber)?.id]
      );

      if (existingPvm && existingPvm.length > 0) {
        alert(`Ручей ${selectedStreamNumber} уже занят ПВМ №${existingPvm[0].number}`);
        return;
      }

      // Find the stream by number
      const stream = streams.find(s => s.number === selectedStreamNumber);

      if (!stream) {
        alert('Ошибка: выбранный ручей не найден. Пожалуйста, выберите другой ручей.');
        return;
      }

      // First update the stream assignment
      const { error: assignError } = await db.insertStreamAssignment({
        pvm_id: pvm.id,
        stream_id: stream.id,
        run_at_assignment: pvm.currentRun
      });

      if (assignError) {
        alert('Ошибка при назначении ручья');
        return;
      }

      // Then update the PVM's stream
      const { error: updateError } = await db.updatePVM(pvm.id, {
        status: pvm.status,
        current_run: pvm.currentRun,
        total_run: pvm.totalRun,
        stream_id: stream.id
      });

      if (updateError) {
        alert('Ошибка при обновлении ПВМ');
        return;
      }
    }

    onMove(newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Переместить ПВМ №{pvm.number}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Always show stream selection when moving to work */}
          {pvm.status !== 'inWork' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Выберите ручей
              </label>
              <select
                value={selectedStreamNumber}
                onChange={(e) => setSelectedStreamNumber(e.target.value ? Number(e.target.value) : '')}
                className="w-full border rounded-lg p-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading}
              >
                <option value="">Выберите ручей</option>
                {STREAM_NUMBERS.map(number => (
                  <option key={number} value={number}>
                    Ручей №{number}
                  </option>
                ))}
              </select>
            </div>
          )}

          {pvm.status !== 'inWork' && (
            <button
              onClick={() => handleMove('inWork')}
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Вернуть в работу
            </button>
          )}
          
          {pvm.status !== 'inStock' && (
            <button
              onClick={() => handleMove('inStock')}
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Переместить на склад
            </button>
          )}
          
          {pvm.status !== 'inRepair' && (
            <button
              onClick={() => handleMove('inRepair')}
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Отправить в ремонт
            </button>
          )}
          {loading && (
            <div className="text-center text-sm text-gray-500">
              Загрузка...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}