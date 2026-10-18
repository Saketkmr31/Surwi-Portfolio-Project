'use client';
import { FormEvent, useState } from 'react';
export default function ContactForm({tone='blue'}:{tone?:'blue'|'purple'}) {
 const [sent,setSent]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');const form=e.currentTarget;const data=new FormData(form);const endpoint=process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  if(!endpoint){setError('Form delivery is not connected yet. Add your Formspree endpoint in .env.local before publishing.');return;}
  setBusy(true);try{const response=await fetch(endpoint,{method:'POST',body:data,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Could not send your message. Please try again.');setSent(true);form.reset();}catch(err){setError(err instanceof Error?err.message:'Message failed to send.');}finally{setBusy(false)}
 }
 if(sent)return <div className="success-message"><span>✓</span><h3>Message sent.</h3><p>Thanks for reaching out. Your message has been submitted.</p></div>;
 return <form className={`contact-form ${tone}`} onSubmit={submit}>
  <div className="form-row"><label>Name<input name="name" autoComplete="name" required placeholder="Your name"/></label><label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label></div>
  <label>What would you like to discuss?<select name="topic" defaultValue="Professional opportunity"><option>Professional opportunity</option><option>Collaboration</option><option>Content / brand partnership</option><option>Something else</option></select></label>
  <label>Message<textarea name="message" rows={4} required minLength={10} placeholder="Write a few lines..."/></label>
  <input type="text" name="company_website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
  {error&&<p className="form-error" role="alert">{error}</p>}<button className="submit-button" disabled={busy}>{busy?'Sending…':'Send message ↗'}</button><p className="form-note">Your message is sent securely through the configured form provider.</p>
 </form>
}
