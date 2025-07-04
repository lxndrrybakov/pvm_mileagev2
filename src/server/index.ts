import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pool, { query } from './database';

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// PVMs
app.get('/pvms', async (req, res) => {
  try {
    console.log('GET /pvms: Fetching all PVMs');
    const { rows } = await query('SELECT * FROM pvms');
    console.log('Found PVMs:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching PVMs:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/pvms', async (req, res) => {
  try {
    const { number, status, current_run, total_run, stream_id } = req.body;
    console.log('POST /pvms:', { number, status, current_run, total_run, stream_id });
    const { rows } = await query(
      'INSERT INTO pvms (number, status, current_run, total_run, stream_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [number, status, current_run, total_run, stream_id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error creating PVM:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.put('/pvms/:id', async (req, res) => {
  try {
    const { status, current_run, total_run, stream_id } = req.body;
    console.log('PUT /pvms/:id:', { id: req.params.id, status, current_run, total_run, stream_id });
    const { rows } = await query(
      'UPDATE pvms SET status = $1, current_run = $2, total_run = $3, stream_id = $4 WHERE id = $5 RETURNING *',
      [status, current_run, total_run, stream_id, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating PVM:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/pvms/:id', async (req, res) => {
  try {
    console.log('DELETE /pvms/:id:', { id: req.params.id });
    await query('DELETE FROM pvms WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting PVM:', err);
    res.status(500).json({ error: String(err) });
  }
});

// PVM Runs
app.get('/pvm-runs', async (req, res) => {
  try {
    console.log('GET /pvm-runs');
    const { rows } = await query(`
      SELECT pr.*, p.number as pvm_number, p.status as pvm_status 
      FROM pvm_runs pr 
      JOIN pvms p ON pr.pvm_id = p.id
      ORDER BY pr.created_at DESC
    `);
    console.log('Found PVM runs:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching PVM runs:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/pvm-runs', async (req, res) => {
  try {
    const { pvm_id, blank_size, num_blanks, tech_scrap, run_distance, is_repair_record, stream_id } = req.body;
    console.log('POST /pvm-runs:', { pvm_id, blank_size, num_blanks, tech_scrap, run_distance, is_repair_record, stream_id });
    const { rows } = await query(
      'INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, is_repair_record, stream_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [pvm_id, blank_size, num_blanks, tech_scrap, run_distance, is_repair_record, stream_id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error creating PVM run:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/pvm-runs', async (req, res) => {
  try {
    const { period } = req.body;
    console.log('DELETE /pvm-runs:', { period });
    let queryText = 'DELETE FROM pvm_runs';
    if (period && period !== 'all') {
      queryText += ` WHERE created_at >= NOW() - INTERVAL '1 ${period}'`;
    }
    await query(queryText);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting PVM runs:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Streams
app.get('/streams', async (req, res) => {
  try {
    console.log('GET /streams');
    const { rows } = await query('SELECT * FROM streams ORDER BY number');
    console.log('Found streams:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching streams:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.put('/streams/:id', async (req, res) => {
  try {
    const { number, total_run, monthly_run } = req.body;
    console.log('PUT /streams/:id:', { id: req.params.id, number, total_run, monthly_run });
    const { rows } = await query(
      'UPDATE streams SET number = $1, total_run = $2, monthly_run = $3 WHERE id = $4 RETURNING *',
      [number, total_run, monthly_run, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating stream:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Stream Assignments
app.get('/stream-assignments', async (req, res) => {
  try {
    const { pvm_id } = req.query;
    console.log('GET /stream-assignments:', { pvm_id });
    const { rows } = await query(
      'SELECT * FROM stream_assignments WHERE pvm_id = $1 ORDER BY assigned_at DESC',
      [pvm_id]
    );
    console.log('Found stream assignments:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching stream assignments:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/stream-assignments', async (req, res) => {
  try {
    const { pvm_id, stream_id, run_at_assignment } = req.body;
    console.log('POST /stream-assignments:', { pvm_id, stream_id, run_at_assignment });
    const { rows } = await query(
      'INSERT INTO stream_assignments (pvm_id, stream_id, run_at_assignment) VALUES ($1, $2, $3) RETURNING *',
      [pvm_id, stream_id, run_at_assignment]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error creating stream assignment:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Raw SQL query endpoint
app.post('/query', async (req, res) => {
  try {
    const { sql, params } = req.body;
    console.log('POST /query:', { sql });
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Server health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});