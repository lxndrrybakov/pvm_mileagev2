export interface PVM {
  id: string;
  number: string;
  status: 'inWork' | 'inStock' | 'inRepair';
  current_run: number;
  total_run: number;
  stream_id?: string | null;
  created_at: string;
}

export interface PVMRun {
  id: string;
  pvm_id: string;
  blank_size: '130' | '150';
  num_blanks: number;
  tech_scrap: number;
  run_distance: number;
  created_at: string;
  is_repair_record: boolean;
  stream_id?: string | null;
  pvm_number?: string;
  pvm_status?: string;
}

export interface Stream {
  id: string;
  number: number;
  total_run: number;
  monthly_run: number;
  created_at: string;
}

export interface StreamAssignment {
  id: string;
  pvm_id: string;
  stream_id: string;
  assigned_at: string;
  run_at_assignment: number;
}