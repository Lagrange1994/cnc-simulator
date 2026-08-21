
import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { formatHoursMinutes } from '../lib/format';

const STATUS_STYLES: Record<JobStatus, { dot: string; text: string; badge: string; label: string }> = {
  active:  { dot: 'bg-cds-interactive animate-pulse', text: 'text-cds-interactive', badge: 'bg-cds-interactive/10 border-cds-interactive/30', label: 'ACTIVE' },
  queued:  { dot: 'bg-cds-text-04',                   text: 'text-cds-text-03',     badge: 'bg-cds-layer-02/50 border-cds-border/30',         label: 'QUEUED' },
  done:    { dot: 'bg-cds-success',                   text: 'text-cds-success',     badge: 'bg-cds-success/10 border-cds-success/30',         label: 'DONE' },
  skipped: { dot: 'bg-cds-text-04',                   text: 'text-cds-text-04',     badge: 'bg-black/30 border-cds-border/20',                label: 'SKIPPED' },
};

interface JobQueueProps {
  onClose: () => void;
  jobs: Job[];
  /** Wall-clock duration of one full pass through the loaded program --
   * programSummary.totalDurationMs from App.tsx -- used to project ETA for
   * whatever's left in each job and the queue as a whole. */
  cycleTimeMs: number;
  /** Current unit's live progress (status.progress) -- only meaningful for
   * whichever job is 'active', painted as a secondary bar on that row so an
   * in-progress cut doesn't read as 0% of its own unit. */
  activeUnitProgressPercent: number;
  onAddJob: (partName: string, quantity: number) => void;
  onRemoveJob: (id: string) => void;
  onSkipJob: (id: string) => void;
}

const JobRow: React.FC<{
  job: Job;
  cycleTimeMs: number;
  activeUnitProgressPercent: number;
  onRemove: () => void;
  onSkip: () => void;
}> = ({ job, cycleTimeMs, activeUnitProgressPercent, onRemove, onSkip }) => {
  const style = STATUS_STYLES[job.status];
  const finishedQty = job.completedQty + job.scrappedQty;
  const percent = job.quantity > 0 ? Math.min(100, (finishedQty / job.quantity) * 100) : 100;
  const remainingQty = Math.max(0, job.quantity - finishedQty);
  const etaMs = remainingQty * cycleTimeMs;
  const canSkip = job.status === 'active' || job.status === 'queued';
  const canRemove = job.status !== 'active';

  return (
    <div className={`bg-cds-bg/60 border p-4 chamfer-md flex flex-col gap-3 relative ${job.status === 'active' ? 'border-cds-interactive/50 shadow-[0_0_20px_rgba(var(--cds-interactive-glow-rgb),0.1)]' : 'border-cds-border/30'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-cds-text-01 font-semibold text-body-sm tracking-wide truncate">{job.partName}</h3>
          <p className="text-cds-text-04 text-[9px] mt-0.5 font-mono uppercase tracking-tighter truncate">{job.programName}</p>
        </div>
        <div className={`inline-flex items-center gap-2 shrink-0 px-2 py-1 border ${style.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
          <span className={`text-[9px] font-semibold tracking-widest ${style.text}`}>{style.label}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[9px] text-cds-text-04 uppercase tracking-tighter">
            {job.completedQty} done{job.scrappedQty > 0 ? `, ${job.scrappedQty} scrapped` : ''} / {job.quantity}
          </span>
          <span className="text-[10px] font-mono text-cds-text-03">{percent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-black/40 h-1 overflow-hidden">
          <div className="h-full transition-all duration-500 bg-cds-success" style={{ width: `${percent}%` }}></div>
        </div>
      </div>

      {job.status === 'active' && (
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] text-cds-text-04 uppercase tracking-tighter">Current unit</span>
            <span className="text-[10px] font-mono text-cds-text-03">{Math.round(activeUnitProgressPercent)}%</span>
          </div>
          <div className="w-full bg-black/40 h-1 overflow-hidden">
            <div className="h-full transition-all duration-500 bg-cds-interactive" style={{ width: `${Math.min(100, Math.max(0, activeUnitProgressPercent))}%` }}></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[9px] font-mono text-cds-text-04">
        <span>{job.status === 'done' || job.status === 'skipped' ? '--' : `EST REMAINING: ${formatHoursMinutes(etaMs)}`}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={!canSkip}
            className="px-2 py-1 border border-cds-border-str/40 text-cds-text-04 hover:text-cds-warning hover:border-cds-warning/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label={`Remove ${job.partName} from queue`}
            className="px-2 py-1 border border-cds-border-str/40 text-cds-text-04 hover:text-cds-error hover:border-cds-error/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const JobQueue: React.FC<JobQueueProps> = ({ onClose, jobs, cycleTimeMs, activeUnitProgressPercent, onAddJob, onRemoveJob, onSkipJob }) => {
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const pendingJobs = jobs.filter(j => j.status === 'active' || j.status === 'queued');
  const totalRemainingQty = pendingJobs.reduce((sum, j) => sum + Math.max(0, j.quantity - j.completedQty - j.scrappedQty), 0);
  const queueEtaMs = totalRemainingQty * cycleTimeMs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = partName.trim();
    if (!trimmedName || quantity < 1) return;
    onAddJob(trimmedName, quantity);
    setPartName('');
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 bg-cds-bg/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div role="dialog" aria-modal="true" aria-labelledby="job-queue-title" className="w-full h-full max-w-[1400px] bg-cds-layer-01 border border-cds-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Header */}
        <div className="h-16 px-8 bg-black/40 border-b border-cds-border/30 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-cds-interactive text-2xl" aria-hidden="true">assignment</span>
            <div>
              <h1 id="job-queue-title" className="font-display text-cds-text-01 font-semibold text-body-sm tracking-[0.3em] uppercase leading-tight">JOB QUEUE</h1>
              <p className="text-[9px] text-cds-text-04 font-mono tracking-widest uppercase">Work Order Queue // MACHINE_01</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-cds-interactive"><span className="w-1.5 h-1.5 rounded-full bg-cds-interactive"></span>{pendingJobs.length} Pending</span>
              <span className="flex items-center gap-1.5 text-cds-text-03"><span className="w-1.5 h-1.5 rounded-full bg-cds-text-04"></span>{jobs.length} Total</span>
            </div>
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center bg-white/5 hover:bg-cds-error/20 hover:text-cds-error transition-all group"
              aria-label="Close Job Queue"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10">
          <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">{jobs.length} Work Orders</h2>
              <p className="text-[10px] text-cds-text-03 font-mono tracking-widest uppercase mt-1">
                One loaded program, several work orders queued behind it -- Cycle Start/Reset outcomes credit the ACTIVE job
              </p>
            </div>

            {/* Add Job -- inline form, not a separate modal, since the input
                surface is just two fields. */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div>
                <label htmlFor="job-part-name" className="block text-[8px] text-cds-text-04 uppercase tracking-widest mb-1">Part Name</label>
                <input
                  id="job-part-name"
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. Bearing Housing"
                  className="h-9 w-48 bg-black/40 border border-cds-border/30 px-2 text-label font-mono text-cds-text-02 outline-none focus:border-cds-interactive"
                />
              </div>
              <div>
                <label htmlFor="job-quantity" className="block text-[8px] text-cds-text-04 uppercase tracking-widest mb-1">Quantity</label>
                <input
                  id="job-quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="h-9 w-20 bg-black/40 border border-cds-border/30 px-2 text-label font-mono text-cds-text-02 outline-none focus:border-cds-interactive"
                />
              </div>
              <button
                type="submit"
                disabled={!partName.trim()}
                className="h-9 px-4 bg-cds-interactive hover:bg-cds-link text-white text-[10px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add to Queue
              </button>
            </form>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-cds-text-04 mb-6 block" aria-hidden="true">assignment_late</span>
              <p className="text-cds-text-03 text-body-sm">Queue is empty. Add a work order above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobRow
                  key={job.id}
                  job={job}
                  cycleTimeMs={cycleTimeMs}
                  activeUnitProgressPercent={activeUnitProgressPercent}
                  onRemove={() => onRemoveJob(job.id)}
                  onSkip={() => onSkipJob(job.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-10 bg-cds-bg px-8 border-t border-cds-border/30 flex items-center justify-between text-[9px] font-mono text-cds-text-04 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-cds-success"></div> QUEUE_LINK: OPTIMAL</span>
            <span>{totalRemainingQty} parts remaining</span>
          </div>
          <div>QUEUE ETA: {formatHoursMinutes(queueEtaMs)}</div>
        </div>
      </div>
    </div>
  );
};

export default JobQueue;
