import { brl, compactBrl, percent } from '../utils/formatters'
import { CardHelpButton } from './CardHelpButton'

const axisColors = ['#124986', '#2EA6A1', '#77C6CC', '#5F7A8D', '#8DA0B4', '#1B2D4A']

function projectLabel(count) {
  return `${count || 0} ${count === 1 ? 'projeto' : 'projetos'}`
}

export function AxisOverview({ title, subtitle, items, limit = 6, info }) {
  const visible = items.slice(0, limit)
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const max = Math.max(...visible.map((item) => Math.abs(item.value || 0)), 1)
  const lead = visible[0]
  const second = visible[1]
  const leadShare = total && lead ? lead.value / total : 0
  const topTwoShare = total
    ? visible.slice(0, 2).reduce((sum, item) => sum + Number(item.value || 0), 0) / total
    : 0
  const remainingShare = Math.max(0, 1 - topTwoShare)

  return (
    <section className="panel axis-overview">
      <CardHelpButton
        title={title}
        description={info || 'Visao executiva da distribuicao do valor contratado por eixo estrategico.'}
        detail={subtitle || `${visible.length} eixos exibidos`}
        value={lead ? `${percent.format(leadShare)} no eixo lider` : 'Sem dados'}
      />
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      {lead ? (
        <>
          <div className="axis-overview__story">
            <article className="axis-overview__lead">
              <span>Eixo com maior concentracao</span>
              <h3 title={lead.label}>{lead.label}</h3>
              <div className="axis-overview__lead-metrics">
                <strong>{compactBrl.format(lead.value)}</strong>
                <b>{percent.format(leadShare)}</b>
              </div>
              <small>
                {projectLabel(lead.count)} - {brl.format(lead.value)}
              </small>
            </article>

            <div className="axis-overview__facts">
              <div>
                <span>Total contratado</span>
                <strong>{compactBrl.format(total)}</strong>
              </div>
              <div>
                <span>Top 2 eixos</span>
                <strong>{percent.format(topTwoShare)}</strong>
                {second ? <small>{lead.label} + {second.label}</small> : null}
              </div>
              <div>
                <span>Demais eixos</span>
                <strong>{percent.format(remainingShare)}</strong>
              </div>
            </div>
          </div>

          <div className="axis-overview__distribution" aria-label="Participacao dos eixos no valor contratado">
            {visible.map((item, index) => (
              <i
                key={`${item.label}-share`}
                style={{
                  width: `${total ? Math.max((item.value / total) * 100, 1.2) : 0}%`,
                  background: axisColors[index % axisColors.length],
                }}
                title={`${item.label}: ${percent.format(total ? item.value / total : 0)}`}
              />
            ))}
          </div>

          <div className="axis-overview__list">
            {visible.map((item, index) => {
              const share = total ? item.value / total : 0
              return (
                <article className={index === 0 ? 'axis-overview__item is-lead' : 'axis-overview__item'} key={item.label}>
                  <div className="axis-overview__item-head">
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <span>{percent.format(share)}</span>
                  </div>
                  <h3 title={item.label}>{item.label}</h3>
                  <div className="axis-overview__item-bar">
                    <i
                      style={{
                        width: `${(Math.abs(item.value) / max) * 100}%`,
                        background: axisColors[index % axisColors.length],
                      }}
                    />
                  </div>
                  <div className="axis-overview__item-foot">
                    <strong>{compactBrl.format(item.value)}</strong>
                    <small>{projectLabel(item.count)}</small>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <div className="axis-overview__empty">Sem eixos para os filtros atuais.</div>
      )}
    </section>
  )
}
