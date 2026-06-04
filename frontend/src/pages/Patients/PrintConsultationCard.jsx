import React from 'react';
import { format } from 'date-fns';

const B = '#5B21B6';
const BL = '#E9DDF7';
const K = '#1F1B2E';
const D = '#D7C2EF';

function CB({ checked }) {
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px',
      border: `1.5px solid ${checked ? B : '#aaa'}`, borderRadius: '1px',
      marginRight: '2px', verticalAlign: 'middle',
      fontSize: '8px', lineHeight: '9px', textAlign: 'center',
      color: B, backgroundColor: checked ? BL : 'transparent',
    }}>
      {checked ? '✓' : ''}
    </span>
  );
}

export default function PrintConsultationCard({ patient, consultation }) {
  if (!patient || !consultation) return null;

  const vacc = (patient.vaccinations || []).map(v => v.type.toLowerCase());
  const hv = (...t) => t.some(x => vacc.some(v => v.includes(x)));
  const dw = (patient.dewormings || []).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const mu = (consultation.mucosa || '').toLowerCase();
  const hm = (...t) => t.some(x => mu.includes(x));
  const isCan = /perro|can/i.test(patient.species || '');
  const isFel = /gato|felin/i.test(patient.species || '');
  const pd = consultation.prevDiseases || '';
  const pi = consultation.prevInterventions || '';
  const pdY = !!pd && !/^no\b/i.test(pd.trim());
  const piY = !!pi && !/^no\b/i.test(pi.trim());
  const fd = (d) => { try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return ''; } };
  const fdt = (d) => { try { return format(new Date(d), 'dd/MM/yyyy HH:mm'); } catch { return ''; } };

  const s = { fontSize: '9px', color: K };
  const lb = { fontWeight: 700, fontSize: '8.5px', color: K, whiteSpace: 'nowrap' };
  const dot = { borderBottom: `1px dotted ${D}`, fontSize: '9px', color: K };
  const hdr = {
    fontSize: '7.5px', fontWeight: 800, color: B, textTransform: 'uppercase',
    letterSpacing: '1.5px', borderBottom: `1px solid ${BL}`,
    paddingBottom: '1px', paddingTop: '6px', marginBottom: '4px',
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: '9px', color: K, padding: '0', lineHeight: 1.4 }}>

      {/* ── HEADER ── */}
      <table style={{ width: '100%', marginBottom: '6px', borderBottom: `2.5px solid ${B}`, paddingBottom: '5px' }}>
        <tbody><tr>
          <td style={{ width: '36px', verticalAlign: 'middle' }}>
            <img src="/logo.webp" alt="" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
          </td>
          <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
            <div style={{ fontSize: '19px', fontWeight: 800, color: B, lineHeight: 1, fontFamily: "'Fraunces', Georgia, serif" }}>Mascolandia</div>
            <div style={{ fontSize: '6.5px', letterSpacing: '2px', color: B, textTransform: 'uppercase', marginTop: '1px' }}>Consultorio Veterinario</div>
          </td>
          <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
            <div style={{ fontSize: '6.5px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Ficha Nº</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: B, letterSpacing: '2px', lineHeight: 1 }}>{consultation.number}</div>
          </td>
        </tr></tbody>
      </table>

      {/* ── DATOS GENERALES ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '22px' }}>DR.:</td>
            <td style={{ ...dot }}>{consultation.vet?.name || ''}</td>
            <td style={{ ...lb, paddingLeft: '6px', width: '38px' }}>FECHA:</td>
            <td style={{ ...dot, width: '14%' }}>{fd(consultation.date)}</td>
            <td style={{ ...lb, paddingLeft: '6px', width: '24px' }}>CEL.:</td>
            <td style={{ ...dot, width: '14%' }}>{patient.ownerPhone}</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '72px' }}>PROPIETARIO:</td>
            <td style={{ ...dot }}>{patient.ownerName}</td>
            <td style={{ ...lb, paddingLeft: '6px', width: '60px' }}>DOMICILIO:</td>
            <td style={{ ...dot }}>{patient.ownerAddress}</td>
            <td style={{ ...lb, paddingLeft: '6px', width: '32px' }}>TELF.:</td>
            <td style={{ ...dot, width: '13%' }}>{patient.ownerPhone}</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '50px' }}>NOMBRE:</td>
            <td style={dot}>{patient.name}</td>
            <td style={{ ...lb, paddingLeft: '5px', width: '30px' }}>RAZA:</td>
            <td style={dot}>{patient.breed || ''}</td>
            <td style={{ ...lb, paddingLeft: '5px', width: '32px' }}>EDAD:</td>
            <td style={{ ...dot, width: '7%' }}>{patient.age || ''}</td>
            <td style={{ ...lb, paddingLeft: '5px', width: '30px' }}>PESO:</td>
            <td style={{ ...dot, width: '7%' }}>{patient.weight ? `${patient.weight} kg` : ''}</td>
            <td style={{ ...lb, paddingLeft: '5px', width: '30px' }}>SEXO:</td>
            <td style={{ ...dot, width: '7%' }}>{patient.gender || ''}</td>
            <td style={{ ...lb, paddingLeft: '5px', width: '36px' }}>COLOR:</td>
            <td style={{ ...dot, width: '7%' }}>{patient.color || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* ── VACUNACIONES ── */}
      <div style={hdr}>Vacunaciones</div>
      <div style={{ ...s, marginBottom: '1px' }}>
        <span style={{ ...lb, marginRight: '6px' }}>CANINOS:</span>
        {['Parvovirus', 'Exavalente', 'Octavalente', 'Rabia', 'Tos de las perreras'].map((v, i) => {
          const keys = [['parvovirus'], ['exavalente','hexavalente'], ['octavalente'], ['rabia'], ['tos']];
          const checked = v === 'Rabia' ? hv('rabia') && isCan : hv(...keys[i]);
          return <span key={v} style={{ marginRight: '10px' }}><CB checked={checked} /> {v}</span>;
        })}
      </div>
      <div style={{ ...s, marginBottom: '2px' }}>
        <span style={{ ...lb, marginRight: '6px' }}>FELINOS:</span>
        <span style={{ marginRight: '10px' }}><CB checked={hv('rabia') && isFel} /> Rabia</span>
        <span style={{ marginRight: '16px' }}><CB checked={hv('triple')} /> Triple</span>
        <span style={{ marginLeft: '8px' }}>
          Desparasitado: <CB checked={!!dw} /> Sí <CB checked={!dw} /> No
          <span style={{ ...lb, marginLeft: '6px' }}>Cuándo:</span>{' '}
          <span style={{ ...dot, display: 'inline-block', minWidth: '60px' }}>{dw ? fd(dw.date) : ''}</span>
        </span>
      </div>

      {/* ── MOTIVO ── */}
      <div style={hdr}>Motivo de consulta</div>
      <div style={{ ...dot, marginBottom: '2px', minHeight: '13px' }}>{consultation.reason}</div>

      {/* ── ANTECEDENTES ── */}
      <div style={hdr}>Antecedentes</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '120px' }}>Enfermedades previas</td>
            <td style={{ width: '80px', whiteSpace: 'nowrap' }}><CB checked={pdY} /> Sí &nbsp;<CB checked={!pdY} /> No</td>
            <td style={{ ...lb, width: '40px' }}>Cuáles:</td>
            <td style={dot}>{pdY ? pd : ''}</td>
          </tr>
          <tr>
            <td style={lb}>Intervenciones previas</td>
            <td style={{ whiteSpace: 'nowrap' }}><CB checked={piY} /> Sí &nbsp;<CB checked={!piY} /> No</td>
            <td style={lb}>Tipo:</td>
            <td style={dot}>{piY ? pi : ''}</td>
          </tr>
        </tbody>
      </table>

      {/* ── EXAMEN CLÍNICO ── */}
      <div style={hdr}>Examen clínico</div>
      <table style={{ width: '100%', ...s, marginBottom: '4px' }}>
        <tbody><tr>
          <td style={{ verticalAlign: 'top', width: '25%' }}>
            <div style={lb}>ESTADO GENERAL</div>
            {['Bueno','Regular','Malo'].map(v => <div key={v}><CB checked={consultation.generalState === v} /> {v}</div>)}
          </td>
          <td style={{ verticalAlign: 'top', width: '25%' }}>
            <div style={lb}>MUCOSA</div>
            {[['rosada','Rosada'],['palida','Pálida'],['congestio','Congestionada'],['ciano','Cianóticas'],['icteric','Ictéricas']].map(([k,v]) =>
              <div key={k}><CB checked={hm(k)} /> {v}</div>
            )}
          </td>
          <td style={{ verticalAlign: 'top', width: '25%' }}>
            <div style={lb}>APETITO</div>
            {['Normal','Disminuido','Anorexico'].map(v => <div key={v}><CB checked={consultation.appetite === v} /> {v === 'Anorexico' ? 'Anoréxico' : v}</div>)}
          </td>
          <td style={{ verticalAlign: 'top', width: '25%' }}>
            <div style={lb}>HIDRATACIÓN</div>
            {['Normal','Dest. Leve','Dest. Moderada','Dest. Grave'].map(v => <div key={v}><CB checked={consultation.hydration === v} /> {v}</div>)}
          </td>
        </tr></tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '72px' }}>TEMPERATURA:</td>
            <td style={{ width: '42px' }}>
              <span style={{ border: `1px solid ${B}`, borderRadius: '2px', padding: '0 4px', fontWeight: 600 }}>
                {consultation.temperature ? `${consultation.temperature}°C` : ''}
              </span>
            </td>
            <td style={{ ...lb, paddingLeft: '8px', width: '70px' }}>RESPIRACIÓN:</td>
            <td><CB checked={consultation.respirationType === 'Normal'} /> Normal <CB checked={consultation.respirationType === 'Disnea'} /> Disnea</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '18px' }}>FR:</td>
            <td style={{ ...dot, width: '40%' }}>{consultation.respRate ? `${consultation.respRate} resp/min` : ''}</td>
            <td style={{ ...lb, paddingLeft: '10px', width: '18px' }}>FC:</td>
            <td style={dot}>{consultation.heartRate ? `${consultation.heartRate} lat/min` : ''}</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '68px' }}>Ap. Digestivo:</td>
            <td style={{ ...dot, width: '38%' }}>{consultation.digestiveSystem || ''}</td>
            <td style={{ ...lb, paddingLeft: '8px', width: '90px' }}>Ap. Genitourinario:</td>
            <td style={dot}>{consultation.genitourinarySystem || ''}</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ ...lb, width: '90px' }}>Examen solicitado:</td>
            <td style={dot}>{consultation.requestedExams || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* ── DIAGNÓSTICO ── */}
      <div style={hdr}>Diagnóstico y tratamiento</div>
      {[['1. Diagnóstico:', consultation.diagnosis],['2. Pronóstico:', consultation.prognosis],['3. Tratamiento indicado:', consultation.treatment]].map(([lbl, val]) => (
        <table key={lbl} style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
          <tbody><tr>
            <td style={{ ...lb, width: lbl.length > 16 ? '118px' : '80px' }}>{lbl}</td>
            <td style={dot}>{val || ''}</td>
          </tr></tbody>
        </table>
      ))}

      {/* ── EVOLUCIÓN ── */}
      <div style={hdr}>Evolución</div>
      {[0,1,2,3,4].map(i => {
        const ev = (consultation.evolutions || [])[i];
        return (
          <table key={i} style={{ width: '100%', borderCollapse: 'collapse', ...s, marginBottom: '2px' }}>
            <tbody><tr>
              <td style={{ ...lb, width: '36px' }}>Fecha:</td>
              <td style={dot}>{ev ? `${fdt(ev.date)} — ${ev.text}` : ''}</td>
            </tr></tbody>
          </table>
        );
      })}

      {/* ── FIRMA ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', ...s, marginTop: '10px', borderTop: `2px solid ${B}`, paddingTop: '6px' }}>
        <tbody><tr>
          <td style={{ ...lb, width: '180px', paddingTop: '6px' }}>Nombre y apellido médico clínico:</td>
          <td style={{ ...dot, paddingTop: '6px' }}>{consultation.vet?.name || ''}</td>
          <td style={{ ...lb, paddingLeft: '10px', width: '36px', paddingTop: '6px' }}>Firma:</td>
          <td style={{ ...dot, width: '15%', paddingTop: '6px' }}>{' '}</td>
        </tr></tbody>
      </table>
    </div>
  );
}
