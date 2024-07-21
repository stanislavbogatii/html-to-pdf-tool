import { useState } from 'react';
import './App.css';

function App() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('A4');
  const [landscape, setLandscape] = useState(false);
  const [scale, setScale] = useState(1);
  const [left, setleft] = useState(undefined);
  const [right, setRight] = useState(undefined);
  const [top, setTop] = useState(undefined);
  const [bottom, setBottom] = useState(undefined);
  const [containerId, setContainerId] = useState(undefined);

    const getPdf = (e) => {
      e?.preventDefault()
      if (!value) return;
      const formData = new FormData();
      formData.append('file', value);
      setLoading(true);
      fetch('https://html2pdf.extensive.digital/api/html-pdf/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },    
        body: JSON.stringify({
          url: value, 
          format, landscape, 
          scale: Number(scale),
          left, 
          right,
          top,
          bottom,
          containerId
        }),
      })
      .then(response => { setLoading(false); return response.blob(); })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'converted.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {console.error('Error:', error); setLoading(false); });
    }


  return (
    <div className="App flex w-full justify-center px-5">
      <div className='w-fit mt-[20%]'>
        <h1 className='md:text-[64px] xs:text-[46px] text-[32px] text-gray-700 font-bold text-center '>HTML to PDF Converter</h1>
        <form
        onSubmit={getPdf}
        className='md:mt-10 mt-5 w-full flex gap-2 items-center justify-center flex-col'>
          <input 
          placeholder='Enter link'
          className='px-3 h-12 w-full border-slate-300 border rounded shadow'
          type='text' onChange={(e) => setValue(e?.target?.value)}/>
          
          <div className='flex justify-stretch gap-2 w-full flex-wrap'>
            <input 
            step={1}
            min={0}
            max={20}
            placeholder='top'
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            type='number' onChange={(e) => setTop(e?.target?.value)}/>
            <input 
            step={1}
            min={0}
            max={20}
            placeholder='right'
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            type='number' onChange={(e) => setRight(e?.target?.value)}/>
            <input 
            step={1}
            min={0}
            max={20}
            placeholder='bottom'
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            type='number' onChange={(e) => setBottom(e?.target?.value)}/>
            <input 
            step={1}
            min={0}
            max={20}
            placeholder='left'
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            type='number' onChange={(e) => setleft(e?.target?.value)}/>
            <input 
            placeholder='Html container id'
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            type='text' onChange={(e) => setContainerId(e?.target?.value)}/>
          </div>
          
          <div className='flex justify-stretch gap-2 w-full flex-wrap'>
            <input 
            step={0.1}
            min={0.1}
            max={2}
            defaultValue={scale}
            placeholder='scale'
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            type='number' onChange={(e) => setScale(e?.target?.value)}/>
            <select
            defaultValue={"A4"}
            onChange={(e) => e?.target?.value && setFormat(e.target.value)}
            className='px-3 h-12 flex-1 min-w-[200px] border-slate-300 border rounded shadow'
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A2">A2</option>
              <option value="A1">A1</option>
              <option value="A0">A0</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
              <option value="Tabloid">Tabloid</option>
            </select>
            <select
            defaultValue={landscape}
            onChange={(e) => e?.target?.value && setLandscape(e.target.value === 'true' ? true : false)}
            className='px-3 h-12 border-slate-300 min-w-[200px] flex-1 border rounded shadow'
            >
              <option value={false}>Portrait</option>
              <option value={true}>Landscape</option>
            </select>
            <button
            type='submit'
            disabled={loading}
            className='shadow text-nowrap flex-1 min-w-[200px] border-green-600 border rounded bg-green-600 h-12 px-3 text-white'>
              {loading ? "loading..." : "Get pdf"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
