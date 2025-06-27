import React, { useState, useRef, useEffect } from 'react';

// Note: The 'jspdf' and 'html2canvas' libraries are loaded from external scripts
// in the environment, so they are accessed via the `window` object instead of direct imports.

// --- Helper Components & Icons ---
const AddIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const TrashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const DownloadIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const ArrowDownIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
const EditIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const MapPinIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const RefreshCwIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;


// --- Data & Initial State ---
const LOCATIONS = {
  "Ground Floor": ["Entrance", "Bedroom Shower", "Bathroom Puzzle", "Staircase", "Courtyard", "Graffiti 1", "Weird Office", "Washing Basket", "Dressing Room", "Fake Door"],
  "1st Floor": ["Staircase", "Greenhouse", "Graffiti 2", "Bed Heater Pic", "Sofa Chair Fan Fridge", "B1 Long", "B2 Long", "Courtyard", "Bathroom Hairdryer", "B1 Short", "Cans", "Bird Cage", "Tiny Bathroom"]
};
const GROUP_PHRASES = [
    { type: 'group_phrase', action: 'Group Phrase' },
    { type: 'group_phrase', action: 'Acosta Group Phrase' },
    { type: 'group_phrase', action: 'Morley Group Phrase' },
    { type: 'group_phrase', action: 'Morley + The Place Group Phrase' },
];

const MAP_URLS = {
    "Ground Floor": "https://raw.githubusercontent.com/bgigurtsis/perfpath/main/images/Ground%20floor.png",
    "1st Floor": "https://raw.githubusercontent.com/bgigurtsis/perfpath/main/images/1st%20floor.png"
};

const ROOM_COORDINATES = {
    "Ground Floor": {
        'Entrance': { top: '7%', left: '3%', width: '13%', height: '10%' },
        'Bedroom Shower': { top: '7%', left: '25%', width: '30%', height: '22%' },
        'Bathroom Puzzle': { top: '7%', left: '62%', width: '22%', height: '22%' },
        'Staircase': { top: '20%', left: '3%', width: '15%', height: '60%' },
        'Courtyard': { top: '30%', left: '25%', width: '38%', height: '40%' },
        'Weird Office': { top: '78%', left: '42%', width: '20%', height: '18%' },
        'Graffiti 1': { top: '78%', left: '5%', width: '22%', height: '18%' },
        'Washing Basket': { top: '72%', left: '68%', width: '15%', height: '15%' },
        'Dressing Room': { top: '65%', left: '87%', width: '12%', height: '30%' },
        'Fake Door': { top: '45%', left: '87%', width: '12%', height: '18%' },
    },
    "1st Floor": {
        'Staircase': { top: '28%', left: '3%', width: '12%', height: '65%' },
        'Greenhouse': { top: '24%', left: '3%', width: '12%', height: '25%' },
        'Graffiti 2': { top: '78%', left: '15%', width: '20%', height: '18%' },
        'Bed Heater Pic': { top: '7%', left: '22%', width: '18%', height: '20%' },
        'Sofa Chair Fan Fridge': { top: '7%', left: '42%', width: '22%', height: '22%' },
        'Bathroom Hairdryer': { top: '7%', left: '65%', width: '20%', height: '22%' },
        'B1 Long': { top: '30%', left: '45%', width: '12%', height: '30%' },
        'B2 Long': { top: '68%', left: '45%', width: '15%', height: '25%' },
        'Courtyard': { top: '35%', left: '25%', width: '50%', height: '40%' },
        'B1 Short': { top: '32%', left: '82%', width: '12%', height: '25%' },
        'Cans': { top: '62%', left: '90%', width: '8%', height: '12%' },
        'Bird Cage': { top: '75%', left: '82%', width: '12%', height: '20%' },
        'Tiny Bathroom': { top: '88%', left: '72%', width: '10%', height: '10%'}
    }
};

// --- Core Application Components ---

/**
 * StepForm Component
 */
const StepForm = ({ onSubmit, initialData = {}, buttonText, onCancel }) => {
    const [floor, setFloor] = useState(initialData.floor || 'Ground Floor');
    const [location, setLocation] = useState(initialData.location || '');
    const [action, setAction] = useState(initialData.action || '');
    const [time, setTime] = useState(initialData.time || '');
    const [notes, setNotes] = useState(initialData.notes || '');
    const currentRooms = LOCATIONS[floor] || [];
    const handleSubmit = (e) => { e.preventDefault(); if (location.trim() && action.trim()) onSubmit({ ...initialData, floor, location, action, time, notes }); };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-lg">{Object.keys(LOCATIONS).map(floorName => (<button type="button" key={floorName} onClick={() => setFloor(floorName)} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${floor === floorName ? 'bg-teal-500 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}>{floorName}</button>))}</div>
            <select value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"><option value="" disabled>Select a room...</option>{currentRooms.map(room => (<option key={room} value={room}>{room}</option>))}</select>
            <textarea value={action} onChange={(e) => setAction(e.target.value)} required placeholder="Describe the action..." className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-400" rows="3" />
            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time for action (e.g., 5 mins)" className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-400" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Director's notes (optional)..." className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-400" rows="2" />
            <div className="flex gap-4">{onCancel && <button type="button" onClick={onCancel} className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500">Cancel</button>}<button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600">{buttonText}</button></div>
        </form>
    );
};

/**
 * FlowchartPreview Component
 */
const FlowchartPreview = ({ pathway, performerName, onReset, onSavePdf, isSaving, onEdit, onDelete, onShowMap }) => {
  const flowchartRef = useRef();
  return (
    <div className="w-full max-w-4xl mt-12">
       <div className="p-6 bg-gray-900/80 border border-gray-700 rounded-t-xl flex justify-between items-center flex-wrap gap-4">
         <div><h2 className="text-2xl font-bold text-white">Pathway for: <span className="text-teal-400">{performerName || 'Performer'}</span></h2><p className="text-gray-400 mt-1">Total Performance Length: 90 Minutes</p></div>
         <div className="flex items-center gap-2"><button onClick={onReset} className="flex items-center gap-2 px-4 py-2 bg-rose-600/80 text-white font-semibold rounded-lg hover:bg-rose-600"><TrashIcon className="w-5 h-5"/> Reset</button><button onClick={() => onSavePdf(flowchartRef.current)} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-500"><DownloadIcon className="w-5 h-5"/> {isSaving ? 'Saving...' : 'Save'}</button></div>
       </div>
       <div ref={flowchartRef} id="flowchart" className="p-4 sm:p-8 bg-gray-800/80 backdrop-blur-sm border-x border-b border-gray-700 rounded-b-xl">
        <div className="flex flex-col items-center gap-4">
            {pathway.length <= GROUP_PHRASES.length && pathway.every(p => p.type === 'group_phrase') && <p className="text-gray-400">Add repeating steps to build the flowchart.</p>}
            {pathway.map((step, index) => (
                <React.Fragment key={step.instanceKey || step.id || `step-${index}`}>
                    {step.type === 'group_phrase' ? (<div className="w-full max-w-md p-4 bg-purple-900/50 border-2 border-purple-500 rounded-lg shadow-lg text-center"><p className="font-bold text-purple-200">{step.action}</p></div>) : (
                        <div className="group w-full max-w-2xl p-4 bg-blue-900/50 border-2 border-blue-500 rounded-lg shadow-lg text-left relative">
                            <div className="absolute top-2 right-2 flex gap-1 sm:gap-2">
                                <button onClick={() => onShowMap(step)} className="p-1.5 bg-gray-600 rounded-md hover:bg-green-500"><MapPinIcon className="w-4 h-4"/></button>
                                <button onClick={() => onEdit(step)} className="p-1.5 bg-gray-600 rounded-md hover:bg-yellow-500"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => onDelete(step.id)} className="p-1.5 bg-gray-600 rounded-md hover:bg-rose-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                           <p className="font-semibold text-blue-200 pr-24"><span className="font-bold">Location:</span> {step.location} ({step.floor})</p>
                           <p className="mt-1 text-blue-200"><span className="font-bold">Action:</span> {step.action}</p>
                           {step.time && <p className="mt-1 text-blue-300 text-sm"><span className="font-bold">Time:</span> {step.time}</p>}
                           {step.notes && <p className="mt-2 text-blue-300 text-sm italic border-l-2 border-blue-400 pl-2"><span className="font-bold not-italic">Notes:</span> {step.notes}</p>}
                        </div>
                    )}
                    {index < pathway.length - 1 && <div className="my-2 text-gray-500"><ArrowDownIcon /></div>}
                </React.Fragment>
            ))}
        </div>
       </div>
    </div>
  );
};

/**
 * MapModal Component with Zoom/Pan functionality
 */
const MapModal = ({ step, onClose }) => {
    if (!step) return null;
    const { floor, location } = step;
    const mapUrl = MAP_URLS[floor];
    const highlightCoords = ROOM_COORDINATES[floor]?.[location];

    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const imageContainerRef = useRef(null);
    const lastTouch = useRef({ x: 0, y: 0, dist: 0 });
    const isInteracting = useRef(false);

    const getDistance = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

    const handleTouchStart = (e) => {
        isInteracting.current = true;
        if (e.touches.length === 2) {
            lastTouch.current.dist = getDistance(e.touches);
        }
        lastTouch.current.x = e.touches[0].clientX;
        lastTouch.current.y = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
        if (!isInteracting.current) return;
        e.preventDefault();
        
        setTransform(currentTransform => {
            let newTransform = { ...currentTransform };

            if (e.touches.length === 2) { // Zooming
                const newDist = getDistance(e.touches);
                const scaleChange = newDist / lastTouch.current.dist;
                newTransform.scale = Math.max(1, Math.min(currentTransform.scale * scaleChange, 5)); // Clamp scale
            } else if (e.touches.length === 1) { // Panning
                const dx = e.touches[0].clientX - lastTouch.current.x;
                const dy = e.touches[0].clientY - lastTouch.current.y;
                newTransform.x = currentTransform.x + dx;
                newTransform.y = currentTransform.y + dy;
            }

            return newTransform;
        });

        if (e.touches.length === 2) lastTouch.current.dist = getDistance(e.touches);
        lastTouch.current.x = e.touches[0].clientX;
        lastTouch.current.y = e.touches[0].clientY;
    };

    const handleTouchEnd = () => { isInteracting.current = false; };
    const resetZoom = () => setTransform({ scale: 1, x: 0, y: 0 });

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-gray-900 p-2 sm:p-4 rounded-lg shadow-2xl w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                     <h3 className="text-lg font-bold text-white">{location} ({floor})</h3>
                     <div>
                        <button onClick={resetZoom} className="p-1.5 bg-gray-700 text-white rounded-full shadow-lg mr-2"><RefreshCwIcon className="w-5 h-5"/></button>
                        <button onClick={onClose} className="p-1.5 bg-white text-black rounded-full shadow-lg"><CloseIcon className="w-5 h-5"/></button>
                     </div>
                </div>
                <div ref={imageContainerRef} className="relative overflow-hidden cursor-grab" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                    <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: 'transform 0.05s' }}>
                        <img src={mapUrl} alt={`${floor} map`} className="w-full h-auto rounded-md" crossOrigin="anonymous" />
                        {highlightCoords && <div className="absolute bg-blue-500/50 border-2 border-blue-300 rounded-md" style={{...highlightCoords, pointerEvents: 'none'}}></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};


/**
 * Main App Component
 */
export default function App() {
  const [performerName, setPerformerName] = useState(() => localStorage.getItem('performerName') || '');
  const [userSteps, setUserSteps] = useState(() => { try { const s = localStorage.getItem('userSteps'); return s ? JSON.parse(s) : [] } catch { return [] } });
  const [isSaving, setIsSaving] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [mapModalStep, setMapModalStep] = useState(null);

  useEffect(() => { localStorage.setItem('performerName', performerName); }, [performerName]);
  useEffect(() => { localStorage.setItem('userSteps', JSON.stringify(userSteps)); }, [userSteps]);

  const handleAddStep = (stepData) => { if (userSteps.length < 6) setUserSteps([...userSteps, { ...stepData, type: 'user_step', id: crypto.randomUUID() }]); };
  const handleUpdateStep = (updatedStep) => { setUserSteps(userSteps.map(step => step.id === updatedStep.id ? updatedStep : step)); setEditingStep(null); };
  const handleDeleteStep = (id) => { setUserSteps(userSteps.filter(step => step.id !== id)); };
  const handleResetPathway = () => { setUserSteps([]); setPerformerName(''); localStorage.clear(); };

  const handleSavePdf = (element) => {
      if (!window.jspdf || !window.html2canvas || !element || isSaving) return;
      setIsSaving(true);
      const { jsPDF } = window.jspdf;
      
      const buttons = element.querySelectorAll('.group .absolute');
      buttons.forEach(b => b.style.visibility = 'hidden');
      
      window.html2canvas(element, { scale: 2, backgroundColor: '#111827', useCORS: true })
        .then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth(), pdfHeight = pdf.internal.pageSize.getHeight(), ratio = canvas.width / canvas.height;
            let imgWidth = pdfWidth - 20, imgHeight = imgWidth / ratio;
            if (imgHeight > pdfHeight - 20) { imgHeight = pdfHeight - 20; imgWidth = imgHeight * ratio; }
            const x = (pdfWidth - imgWidth) / 2, y = 10;
            pdf.setFontSize(16);
            pdf.text(`Pathway: ${performerName || 'Unnamed'}`, pdfWidth / 2, y, { align: 'center' });
            pdf.addImage(imgData, 'PNG', x, y + 10, imgWidth, imgHeight);
            pdf.save(`${(performerName || 'pathway').replace(/\s+/g, '_')}.pdf`);
        })
        .catch(err => console.error("PDF Error:", err))
        .finally(() => { buttons.forEach(b => b.style.visibility = ''); setIsSaving(false); });
  };

  const finalPathway = [];
  GROUP_PHRASES.forEach((phrase, groupIndex) => {
      finalPathway.push({ ...phrase, id: `group-${groupIndex}` });
      if (userSteps.length > 0 && groupIndex < GROUP_PHRASES.length - 1) {
          finalPathway.push(...userSteps.map(userStep => ({ ...userStep, instanceKey: `${userStep.id}-${groupIndex}` })));
      }
  });

  return (
    <main className="min-h-screen w-full bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-8">
      {isSaving && <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"><p className="bg-gray-800 p-6 rounded-lg">Saving PDF...</p></div>}
      {editingStep && <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div className="w-full max-w-xl bg-gray-800 p-6 rounded-lg"><h2 className="text-xl font-bold mb-4">Edit Step</h2><StepForm onSubmit={handleUpdateStep} initialData={editingStep} buttonText="Save Changes" onCancel={() => setEditingStep(null)} /></div></div>}
      <MapModal step={mapModalStep} onClose={() => setMapModalStep(null)} />

      <div className="absolute inset-0 bg-grid-gray-700/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]" style={{ backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, rgba(100, 116, 139, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.2) 1px, transparent 1px)'}}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <header className="mb-10 w-full max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-400">Performance Pathway Builder</h1>
          <p className="mt-4 text-lg text-gray-300">Your work saves automatically. Add a performer's name, then create repeating steps.</p>
          <input type="text" value={performerName} onChange={(e) => setPerformerName(e.target.value)} placeholder="Enter Performer's Name..." className="w-full max-w-md mx-auto mt-6 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-400" />
        </header>

        <div className="w-full max-w-xl bg-gray-800/60 p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Add Repeating Step ({userSteps.length}/6)</h2>
            <StepForm onSubmit={handleAddStep} buttonText={<><AddIcon className="w-5 h-5"/> Add Step</>} />
        </div>
        
        <FlowchartPreview 
            pathway={finalPathway} 
            performerName={performerName}
            onReset={handleResetPathway} 
            onSavePdf={handleSavePdf} 
            isSaving={isSaving}
            onEdit={setEditingStep}
            onDelete={handleDeleteStep}
            onShowMap={setMapModalStep}
        />
      </div>
      <footer className="relative z-10 text-center mt-12 text-gray-500 text-sm"><p>An interactive experience builder for your performance space.</p></footer>
    </main>
  );
}
