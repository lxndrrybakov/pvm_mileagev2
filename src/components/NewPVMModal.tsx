import React from 'react';
import { X } from 'lucide-react';
import { db } from '../lib/database';

interface Props {
  onClose: () => void;
}

export default function NewPVMModal({ onClose }: Props) {
  const [number, setNumber] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await db.insertPVM({
      number,
      status: 'inWork',
      current_run: 0,
      total_run: 0
    });

    if (error) {
      if (error.code === '23505') {
        alert('ПВМ с таким номером уже существует');
      } else {
        alert('Ошибка при создании ПВМ');
      }
      return;
    }

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Добавить новый ПВМ</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер ПВМ
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Введите номер"
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}