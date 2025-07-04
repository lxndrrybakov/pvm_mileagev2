import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PVM, RunFormData } from './types';
import MachineGrid from './components/MachineGrid';
import RunForm from './components/RunForm';
import MoveForm from './components/MoveForm';
import Header from './components/Header';
import { db, query } from './lib/database';

async function initializePVMs() {
  const { data: existingPVMs, error } = await db.getPVMs();
  
  if (error) {
    console.error('Error checking PVMs:', error);
    return [];
  }
  
  if (!existingPVMs?.length) {
    const initialPVMs = Array.from({ length: 11 }, (_, i) => ({
      number: String(i + 1),
      status: 'inWork',
      current_run: 0,
      total_run: 0
    }));
    
    const insertPromises = initialPVMs.map(pvm => db.insertPVM(pvm));
    const results = await Promise.all(insertPromises);
    
    if (results.some(result => result.error)) {
      console.error('Error initializing PVMs:', results.filter(r => r.error));
      return [];
    }
    
    return initialPVMs;
  }
  
  return existingPVMs;
}

function App() {
  const [pvms, setPvms] = useState<PVM[]>([]);
  const [selectedPvm, setSelectedPvm] = useState<PVM | null>(null);
  const [showRunForm, setShowRunForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPVMs();
  }, []);

  async function loadPVMs() {
    try {
      setError(null);
      const { data: existingPVMs, error: checkError } = await db.getPVMs();
      
      if (checkError) {
        throw checkError;
      }
      
      if (!existingPVMs?.length) {
        await initializePVMs();
      }
      
      // Reload PVMs after initialization
      const { data: pvmRuns, error: runsError } = await db.getPVMRuns();
      const { data: pvms, error } = await db.getPVMs();
      
      if (runsError) {
        throw runsError;
      }

      if (error) {
        throw error;
      }
      
      if (pvms) {
        setPvms(pvms.map(pvm => {
          // Calculate current run from actual run records
          const pvm_runs = pvmRuns?.filter(run => run.pvm_id === pvm.id) || [];
          const currentRun = pvm_runs
            .filter(run => !run.is_repair_record)
            ?.reduce((sum, run) => sum + run.run_distance, 0) || 0;
            
          return {
            ...pvm,
            id: pvm.id,
            currentRun,
            totalRun: currentRun,
            stream_id: pvm.stream_id
          };
        }));
      }
    } catch (error) {
      console.error('Error loading PVMs:', error);
      setError('Ошибка при загрузке данных. Пожалуйста, обновите страницу.');
    }
    setLoading(false);
  }

  const handleAddRun = async (data: RunFormData) => {
    if (!selectedPvm) return;

    const coefficients = { '130': 1.6, '150': 2.2 };
    const fixedScrap = { '130': 0.066, '150': 0.091 };
    
    const runDistance = (data.numBlanks * coefficients[data.blankSize]) + 
                       (data.techScrap + fixedScrap[data.blankSize]);

    // Get current stream assignment
    const { data: assignments } = await db.getStreamAssignments(selectedPvm.id);
    const currentAssignment = assignments && assignments[0];

    setLoading(true);
    try {
      // First insert the run record
      const { error: insertError } = await db.insertPVMRun({
        pvm_id: selectedPvm.id,
        blank_size: data.blankSize,
        num_blanks: data.numBlanks,
        tech_scrap: data.techScrap,
        run_distance: runDistance, 
        is_repair_record: false,
        stream_id: currentAssignment?.stream_id
      });

      if (insertError) {
        throw new Error(`Ошибка при сохранении пробега: ${insertError.message}`);
      }

      // Then update the PVM totals
      const newCurrentRun = selectedPvm.currentRun + runDistance;
      const newTotalRun = selectedPvm.totalRun + runDistance;

      const { error: updateError } = await db.updatePVM(selectedPvm.id, {
        status: selectedPvm.status,
        current_run: newCurrentRun,
        total_run: newTotalRun,
        stream_id: selectedPvm.stream_id
      });

      if (updateError) {
        throw new Error(`Ошибка при обновлении данных ПВМ: ${updateError.message}`);
      }

      await loadPVMs();
    } catch (error) {
      console.error('Error in handleAddRun:', error instanceof Error ? error.message : error);
      alert(error instanceof Error ? error.message : 'Произошла ошибка при добавлении пробега');
    } finally {
      setLoading(false);
      setShowRunForm(false);
      setSelectedPvm(null);
    }
  };

  const handleMove = async (newStatus: PVM['status']) => {
    if (!selectedPvm) return;
    
    setLoading(true);
    try {
      // If moving from repair to work/stock, reset current_run
      const shouldResetRun = selectedPvm.status === 'inRepair' && newStatus !== 'inRepair';
      
      // If moving to repair, save the current run
      const movingToRepair = newStatus === 'inRepair' && selectedPvm.status !== 'inRepair';

      if (movingToRepair) {
        // Get current stream assignment
        const { data: assignments } = await db.getStreamAssignments(selectedPvm.id);
        const currentAssignment = assignments && assignments[0];

        const { error: insertError } = await db.insertPVMRun({
          pvm_id: selectedPvm.id,
          blank_size: '130', // Default value as this is a repair record
          num_blanks: 0,     // Not applicable for repair records
          tech_scrap: 0,     // Not applicable for repair records
          run_distance: selectedPvm.currentRun,
          is_repair_record: true,
          stream_id: currentAssignment?.stream_id
        });
        
        if (insertError) {
          console.error('Error saving repair record:', insertError);
          alert('Ошибка при сохранении записи о ремонте');
          return;
        }
      }

      const { error: updateError } = await db.updatePVM(selectedPvm.id, {
        status: newStatus,
        current_run: shouldResetRun ? 0 : selectedPvm.currentRun,
        total_run: selectedPvm.totalRun,
        stream_id: selectedPvm.stream_id
      });

      if (updateError) {
        console.error('Error updating PVM status:', updateError);
        alert('Ошибка при обновлении статуса ПВМ');
        return;
      }

      await loadPVMs();
    } catch (error) {
      console.error('Error in handleMove:', error);
      alert('Произошла ошибка при перемещении ПВМ');
    } finally {
      setLoading(false);
      setShowMoveForm(false);
      setSelectedPvm(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600 text-center">
        <p className="text-xl font-semibold mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Обновить страницу
        </button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 mb-16">
        <div className="grid grid-cols-1 gap-8">
          <MachineGrid
            pvms={pvms}
            onSelectPvm={pvm => {
              if (pvm.status === 'inWork') {
                setSelectedPvm(pvm);
                setShowRunForm(true);
              }
            }}
            onMove={pvm => {
              setSelectedPvm(pvm);
              setShowMoveForm(true);
            }}
          />
        </div>
      </main>

      {showRunForm && selectedPvm && (
        <RunForm
          pvm={selectedPvm}
          onSubmit={handleAddRun}
          onClose={() => {
            setShowRunForm(false);
            setSelectedPvm(null);
          }}
        />
      )}

      {showMoveForm && selectedPvm && (
        <MoveForm
          pvm={selectedPvm}
          onMove={handleMove}
          onClose={() => {
            setShowMoveForm(false);
            setSelectedPvm(null);
          }}
        />
      )}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white py-3 px-4 text-center text-sm">
        Разработано Рыбаковым Александром. Отдел операционных улучшений. V 2.0 - 2025
      </footer>
    </div>
  );
}

export default App;