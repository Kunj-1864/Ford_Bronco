export default function WheelsSection() {
  return (
    <section className="section-wheels" id="wheels" style={{ height: '200vh' }}>
      <div className="wheels__content">
        <div className="wheels__text">
          <div className="wheels__label">All-Terrain Performance</div>
          <h2 className="wheels__title">GRIP<br />THE<br />EARTH</h2>
          <p className="orbit__desc" style={{ color: '#7A7060', fontSize: '0.85rem', lineHeight: 1.8 }}>
            Available 33" or 35" all-terrain tires mount 
            on bead-lock capable wheels — engineered for 
            extreme terrain and total command.
          </p>
          <ul className="wheels__spec-list">
            <li>
              <span>Wheel Size</span>
              <span>17–18 inch</span>
            </li>
            <li>
              <span>Tire Rating</span>
              <span>35" All-Terrain</span>
            </li>
            <li>
              <span>Suspension</span>
              <span>Independent Front</span>
            </li>
            <li>
              <span>Ground Clearance</span>
              <span>11.6 inches</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
