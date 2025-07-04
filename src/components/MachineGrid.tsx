import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, Trash2 } from 'lucide-react';
import { db, query } from '../lib/database';
import type { PVM, Stream } from '../types';

interface Props {
  pvms: PVM[];
  onSelectPvm: (pvm: PVM) => void;
  onMove: (pvm: PVM) => void;
}

export default function MachineGrid({ pvms, onSelectPvm, onMove }: Props) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const sections = {
    inWork: pvms.filter(p => p.status === 'inWork'),
    inStock: pvms.filter(p => p.status === 'inStock'),
    inRepair: pvms.filter(p => p.status === 'inRepair')
  };

  useEffect(() => {
    loadStreams();
  }, []);

  async function loadStreams() {
    const { data } = await db.getStreams();
    
    if (data) {
      setStreams(data);
    }
  }

  const getStreamNumber = (streamId: string | null | undefined) => {
    if (!streamId) return null;
    const stream = streams.find(s => s.id === streamId);
    return stream ? stream.number : null;
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  const [deletePassword, setDeletePassword] = React.useState('');

  const handleDelete = async (pvmId: string) => {
    if (deletePassword !== '447386') {
      alert('Неверный пароль');
      return;
    }

    const { error } = await db.deletePVM(pvmId);

    if (error) {
      alert('Ошибка при удалении');
      return;
    }

    setShowDeleteConfirm(null);
    setDeletePassword('');
    window.location.reload();
  };

  const getRunClass = (run: number) => {
    if (run >= 65000) {
      return 'critical-pvm';
    }
    if (run >= 45000) {
      return 'warning-pvm';
    }
    return '';
  };

  const renderMachine = (pvm: PVM) => (
    <div
      key={pvm.number}
      className={`
        machine-card cursor-pointer
        relative group
        border-l-4 border-green-500
        ${getRunClass(pvm.currentRun)}
      `}
      onClick={() => onSelectPvm(pvm)}
    >
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(pvm);
          }}
          className="p-2 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
        >
          <ArrowRightLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(pvm.id);
          }}
          className="p-2 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
      <div className="flex items-center justify-center mb-3">
        <img
          src="https://i.imghippo.com/files/KsT1014ygI.jpg"
          alt="PVM"
          className="w-16 h-16 object-cover rounded-lg"
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">ПВМ №{pvm.number}</h3>
        <p className="text-sm text-gray-600">
          Текущий пробег: {pvm.currentRun.toFixed(2)} тонн
        </p>
        {pvm.status === 'inWork' && pvm.stream_id && (
          <p className="text-sm text-gray-500 mt-1">
            Ручей №{getStreamNumber(pvm.stream_id)}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-3 divide-x divide-gray-300">
        <div className="px-8">
          <section>
            <h2 className="text-xl font-bold mb-4">В работе</h2>
            <div className="grid grid-cols-1 gap-4">
              {sections.inWork.map(renderMachine)}
            </div>
          </section>
        </div>
        
        <div className="px-8">
          <section>
            <h2 className="text-xl font-bold mb-4">На складе</h2>
            <div className="grid grid-cols-1 gap-4">
              {sections.inStock.map(renderMachine)}
            </div>
          </section>
        </div>
        
        <div className="px-8">
          <section>
            <h2 className="text-xl font-bold mb-4">В ремонте</h2>
            <div className="grid grid-cols-1 gap-4">
              {sections.inRepair.map(renderMachine)}
            </div>
          </section>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Удаление ПВМ</h3>
            <p className="text-gray-600 mb-4">
              Вы уверены, что хотите удалить этот ПВМ? Это действие нельзя отменить.
            </p>
            <input
              type="password"
              placeholder="Введите пароль"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(null);
                  setDeletePassword('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}