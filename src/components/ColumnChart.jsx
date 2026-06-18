import { CardHelpButton } from './CardHelpButton'

const palette = ['#2EA6A1', '#77C6CC', '#124986']

const formatMillions = (value) => {
  const sign = value < 0 ? '-' : ''
  const millions = Math.abs(value) / 1_000_000
  const formatted = millions.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return `${sign}R$ ${formatted} mi`
}

export function ColumnChart({ title, subtitle, groups, info }) {
  const rubrics = ['Realizado', 'Comprometido', 'Saldo']
  const max = Math.max(...groups.flatMap((group) => group.values.map((value) => Math.abs(value))), 1)
  const isCoordinationChart = title.startsWith('Realizado, Comprometido')
  const displayTitle = isCoordinationChart
    ? 'Realizado, Comprometido e Saldo por Coordena\u00e7\u00e3o'
    : title
  const displaySubtitle = isCoordinationChart
    ? 'Valores consolidados por coordena\u00e7\u00e3o'
    : subtitle
  const displayInfo = isCoordinationChart
    ? 'Compara os valores realizados, comprometidos e os saldos informados para cada coordena\u00e7\u00e3o.'
    : info

  return (
    <section className="panel chart-panel chart-panel--wide">
      <CardHelpButton
        title={displayTitle}
        description={displayInfo || 'Grafico comparativo para enxergar realizado, comprometido e saldo lado a lado por grupo.'}
        detail={displaySubtitle || 'Cada cor representa uma rubrica financeira.'}
        value={`${groups.length} grupos exibidos`}
      />
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>{displayTitle}</h2>
          {displaySubtitle ? <p>{displaySubtitle}</p> : null}
        </div>
      </div>
      <div className="chart-legend">
        {rubrics.map((rubric, index) => (
          <span key={rubric}>
            <i style={{ background: palette[index] }} />
            {rubric}
          </span>
        ))}
      </div>
      <div className="column-chart">
        {groups.map((group) => (
          <div className="column-group" key={group.label}>
            <div className="columns">
              {group.values.map((value, index) => (
                <div
                  key={`${group.label}-${rubrics[index]}`}
                  className={`column-bar has-tooltip${value < 0 ? ' column-bar--negative' : ''}`}
                  data-tooltip={`${group.label} - ${rubrics[index]}: ${formatMillions(value)}`}
                  title={`${rubrics[index]}: ${formatMillions(value)}`}
                  style={{
                    height: `${Math.max((Math.abs(value) / max) * 100, value !== 0 ? 4 : 0)}%`,
                    background: palette[index],
                  }}
                >
                  {index === 0 || Math.abs(value) >= 8_000_000 || value < 0 ? (
                    <b className="col-value">{formatMillions(value)}</b>
                  ) : null}
                </div>
              ))}
            </div>
            <small className="group-label" title={group.label}>{group.label}</small>
          </div>
        ))}
      </div>
      <div className="coordination-table" aria-label="Resumo financeiro por coordenacao">
        <div className="coordination-table__row coordination-table__row--head">
          <span>Coordena&ccedil;&atilde;o</span>
          {rubrics.map((rubric) => (
            <span key={rubric}>{rubric}</span>
          ))}
        </div>
        {groups.map((group) => (
          <div className="coordination-table__row" key={`${group.label}-table`}>
            <strong>{group.label}</strong>
            {group.values.map((value, index) => (
              <span
                className={value < 0 ? 'is-negative' : ''}
                key={`${group.label}-${rubrics[index]}-table`}
              >
                {formatMillions(value)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
