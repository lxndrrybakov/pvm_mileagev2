import React from 'react';
import type { PVM, RunFormData } from '../types';

interface Props {
  pvm: PVM;
  onSubmit: (data: RunFormData) => void;
  onClose: () => void;
}

export default function RunForm({ pvm, onSubmit, onClose }: Props) {
  const [formData, setFormData] = React.useState<RunFormData>({
    numBlanks: '',
    blankSize: '130',
    techScrap: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      numBlanks: parseInt(formData.numBlanks),
      blankSize: formData.blankSize,
      techScrap: parseFloat(formData.techScrap)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Добавить пробег - ПВМ №{pvm.number}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Количество заготовок
            </label>
            <input
              type="number"
              value={formData.numBlanks}
              onChange={e => setFormData(prev => ({ ...prev, numBlanks: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Размер заготовки
            </label>
            <select
              value={formData.blankSize}
              onChange={e => setFormData(prev => ({ ...prev, blankSize: e.target.value as '130' | '150' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="130">130</option>
              <option value="150">150</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Технический брак
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.techScrap}
              onChange={e => setFormData(prev => ({ ...prev, techScrap: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}