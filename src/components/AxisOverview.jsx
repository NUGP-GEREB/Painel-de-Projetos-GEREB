import { percent } from '../utils/formatters'

const fullBrl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function AxisOverview({ title, items, limit = 6 }) {
  const visible = items.slice(0, limit)
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const max = Math.max(...visible.map((item) => Math.abs(item.value || 0)), 1)

  return (
    <section className="panel axis-overview" aria-label={title}>
      <header className="axis-overview__header">
        <span>FIOCRUZ · MAPA ESTRATÉGICO</span>
        <h2>Valor contratado por eixo</h2>
        <p>
          Total: <strong>{fullBrl.format(total)}</strong>
        </p>
      </header>

      {visible.length ? (
        <div className="axis-overview__rows">
          {visible.map((item, index) => {
            const share = total ? item.value / total : 0
            const barWidth = (Math.abs(item.value) / max) * 100

            return (
              <article className="axis-overview__row" key={item.label}>
                <div className="axis-overview__row-top">
                  <div className="axis-overview__label">
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <span title={item.label}>{item.label}</span>
                  </div>
                  <div className="axis-overview__value">
                    <strong>{fullBrl.format(item.value)}</strong>
                    <span>{percent.format(share)}</span>
                  </div>
                </div>
                <div className="axis-overview__track" aria-hidden="true">
                  <i style={{ width: `${Math.max(barWidth, item.value ? 0.8 : 0)}%` }} />
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="axis-overview__empty">Sem eixos para os filtros atuais.</div>
      )}

      <footer className="axis-overview__source">Fonte: Sistema de gestão de contratos</footer>
    </section>
  )
}
