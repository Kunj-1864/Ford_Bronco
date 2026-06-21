export default function RevealSection() {
  return (
    <section className="section-reveal" id="reveal" style={{ height: '200vh' }}>
      <div className="reveal__content">
        <div className="reveal__badge">2021 · Off-Road Icon</div>
        <h2 className="reveal__title">
          FORD<br />BRONCO
        </h2>
        <p className="reveal__desc">
          Born from desert dust and mountain trails. 
          The Bronco returns with modern power and a soul that 
          never forgot where it came from. 
          This is not just an SUV. This is freedom, engineered.
        </p>
        <div className="reveal__cta-group">
          <button className="btn-primary" data-cursor="hover">Configure Yours</button>
          <button className="btn-ghost" data-cursor="hover">Learn More</button>
        </div>
      </div>
    </section>
  )
}
