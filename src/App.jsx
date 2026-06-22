import { useMemo, useState } from "react";
import { AxisOverview } from "./components/AxisOverview";
import { BarList } from "./components/BarList";
import { ColumnChart } from "./components/ColumnChart";
import { DonutChart } from "./components/DonutChart";
import { MetricCard } from "./components/MetricCard";
import { ProjectTable } from "./components/ProjectTable";
import { ResourceDistribution } from "./components/ResourceDistribution";
import fiocruzLogo from "./assets/marca-300x200_1.jpg";
import { projects } from "./data/projects";
import {
  brl,
  groupBySum,
  percent,
  sumBy,
} from "./utils/formatters";
import "./styles/dashboard.css";

const allOption = "Todos";
const supportOptions = [allOption, "Sim", "Não"];
const ministryOfHealth = "MINIST\u00c9RIO DA SA\u00daDE";
const fullBrl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const optionList = (values) => [
  allOption,
  ...new Set(
    values
      .filter(Boolean)
      .map((value) => String(value).trim())
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
  ),
];

function groupFinancials(items, groupKey) {
  const groups = new Map();

  items.forEach((project) => {
    const label = project[groupKey] || "Não informado";
    const current = groups.get(label) || {
      label,
      value: 0,
      detailValue: 0,
      committedValue: 0,
      balanceValue: 0,
      count: 0,
    };

    current.value += Number(project.total || 0);
    current.detailValue += Number(project.realized || 0);
    current.committedValue += Number(project.committed || 0);
    current.balanceValue += Number(project.currentBalance || 0);
    current.count += 1;
    groups.set(label, current);
  });

  return [...groups.values()]
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      detailLabel: "Realizado",
      meta: `${percent.format(item.value ? item.detailValue / item.value : 0)} executado`,
    }));
}

const instrumentOrder = [
  "CONVÊNIO PD&I",
  "TED",
  "EMENDA PARLAMENTAR",
  "LOA",
  "CARTA ACORDO",
  "DISPENSA DE TED",
];

const instrumentColors = {
  "CONVÊNIO PD&I": "#124986",
  TED: "#2EA6A1",
  "EMENDA PARLAMENTAR": "#77C6CC",
  LOA: "#8DA0B4",
  "CARTA ACORDO": "#1B2D4A",
  "DISPENSA DE TED": "#0F4C8A",
};

function normalizeInstrumentType(value) {
  if (value === "EMENDAS") return "EMENDA PARLAMENTAR";
  return value || "Não informado";
}

function groupInstrumentTypes(items) {
  const groups = new Map();

  items.forEach((project) => {
    const label = normalizeInstrumentType(project.instrumentType);
    const current = groups.get(label) || {
      label,
      value: 0,
      detailValue: 0,
      detailTotalValue: 0,
      detailLabel: "Total",
      color: instrumentColors[label],
    };

    current.value += 1;
    current.detailValue += Number(project.total || 0);
    current.detailTotalValue += Number(project.total || 0);
    groups.set(label, current);
  });

  const knownGroups = instrumentOrder
    .map((label) => groups.get(label))
    .filter(Boolean);
  const remainingGroups = [...groups.values()]
    .filter((item) => !instrumentOrder.includes(item.label))
    .sort((a, b) => b.value - a.value);

  return [...knownGroups, ...remainingGroups];
}

function groupCoordinationFinancials(items) {
  const groups = new Map();

  items.forEach((project) => {
    const label = project.unit || "N\u00e3o informado";
    const current = groups.get(label) || {
      label,
      values: [0, 0, 0],
    };

    current.values[0] += Number(project.realized || 0);
    current.values[1] += Number(project.committed || 0);
    current.values[2] += Number(project.currentBalance || 0);
    groups.set(label, current);
  });

  return [...groups.values()].sort((a, b) => b.values[0] - a.values[0]);
}

function groupTedResources(items) {
  const tedProjects = items.filter(
    (project) => normalizeInstrumentType(project.instrumentType) === "TED",
  );

  return [
    {
      label: "TED MS",
      value: sumBy(
        tedProjects.filter(
          (project) => project.funder === ministryOfHealth && !project.supportTed,
        ),
        "total",
      ),
      color: "#2EA6A1",
    },
    {
      label: "TED de SUPORTE",
      value: sumBy(
        tedProjects.filter((project) => project.supportTed),
        "total",
      ),
      color: "#124986",
    },
    {
      label: "TEDs outros \u00d3rg\u00e3os",
      value: sumBy(
        tedProjects.filter(
          (project) => project.funder !== ministryOfHealth && !project.supportTed,
        ),
        "total",
      ),
      color: "#77C6CC",
    },
  ];
}

const projectOptions = [allOption, ...projects.map((project) => project.id)];
const modalityOptions = optionList(
  projects.map((project) => normalizeInstrumentType(project.instrumentType)),
);
const funderOptions = optionList(projects.map((project) => project.funder));
const natureOptions = optionList(projects.map((project) => project.nature));
const axisOptions = optionList(projects.map((project) => project.axis));
const instrumentOptions = optionList(
  projects.map((project) => project.instrumentNumber),
);

function App() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    project: allOption,
    modality: allOption,
    funder: allOption,
    nature: allOption,
    axis: allOption,
    supportTed: allOption,
    instrumentNumber: allOption,
    start: "",
    end: "",
  });

  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesProject =
          filters.project === allOption || project.id === filters.project;
        const matchesModality =
          filters.modality === allOption ||
          normalizeInstrumentType(project.instrumentType) === filters.modality;
        const matchesFunder =
          filters.funder === allOption || project.funder === filters.funder;
        const matchesNature =
          filters.nature === allOption || project.nature === filters.nature;
        const matchesAxis =
          filters.axis === allOption || project.axis === filters.axis;
        const matchesSupport =
          filters.supportTed === allOption ||
          (filters.supportTed === "Sim") === project.supportTed;
        const matchesInstrument =
          filters.instrumentNumber === allOption ||
          project.instrumentNumber === filters.instrumentNumber;
        const matchesStart = !filters.start || project.start >= filters.start;
        const matchesEnd = !filters.end || project.end <= filters.end;

        return (
          matchesProject &&
          matchesModality &&
          matchesFunder &&
          matchesNature &&
          matchesAxis &&
          matchesSupport &&
          matchesInstrument &&
          matchesStart &&
          matchesEnd
        );
      }),
    [filters],
  );

  const totals = useMemo(
    () => {
      const today = new Date();
      const supportTedCount = filteredProjects.filter(
        (project) => project.supportTed,
      ).length;
      const closed = filteredProjects.filter(
        (project) => new Date(`${project.end}T12:00:00`) < today,
      ).length;

      return {
        projects: filteredProjects.length,
        total: sumBy(filteredProjects, "total"),
        budgetBalance: sumBy(filteredProjects, "budgetBalance"),
        released: sumBy(filteredProjects, "released"),
        receivable: sumBy(filteredProjects, "receivable"),
        realized: sumBy(filteredProjects, "realized"),
        committed: sumBy(filteredProjects, "committed"),
        balance: sumBy(filteredProjects, "currentBalance"),
        supportTedCount,
        closed,
        active: filteredProjects.length - closed,
        expiring: filteredProjects.filter((project) => {
          const end = new Date(`${project.end}T12:00:00`);
          const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
          return days >= 0 && days <= 180;
        }).length,
        negativeBalance: filteredProjects.filter(
          (project) => Number(project.currentBalance || 0) < 0,
        ).length,
      };
    },
    [filteredProjects],
  );

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== allOption,
  ).length;
  const filterKey = JSON.stringify(filters);
  const projectCountLabel = activeFilterCount
    ? `${filteredProjects.length} projetos no recorte`
    : `${projects.length} projetos monitorados`;

  const topRealizedProjects = useMemo(
    () =>
      [...filteredProjects]
        .sort((a, b) => b.realized - a.realized)
        .map((project) => ({ label: project.id, value: project.realized })),
    [filteredProjects],
  );

  const topTotalProjects = useMemo(
    () =>
      [...filteredProjects]
        .sort((a, b) => b.total - a.total)
        .map((project) => ({ label: project.id, value: project.total })),
    [filteredProjects],
  );

  const instrumentItems = useMemo(
    () => groupInstrumentTypes(filteredProjects),
    [filteredProjects],
  );

  const natureItems = useMemo(
    () => groupFinancials(filteredProjects, "nature"),
    [filteredProjects],
  );

  const funderItems = useMemo(
    () => groupBySum(filteredProjects, "funder", "total"),
    [filteredProjects],
  );

  const axisItems = useMemo(
    () => groupFinancials(filteredProjects, "axis"),
    [filteredProjects],
  );

  const coordinationGroups = useMemo(
    () => groupCoordinationFinancials(filteredProjects),
    [filteredProjects],
  );

  const selectedProject = useMemo(
    () =>
      filters.project === allOption
        ? null
        : filteredProjects.find((project) => project.id === filters.project),
    [filteredProjects, filters.project],
  );

  const resourceItems = useMemo(
    () => groupTedResources(filteredProjects),
    [filteredProjects],
  );

  const dashboardCards = [
    {
      label: "Projetos Filtrados",
      value: totals.projects,
      tone: "neutral",
      icon: "grid",
      info: "Linhas da planilha que entram no recorte atual.",
    },
    {
      label: "TED de Suporte",
      value: totals.supportTedCount,
      tone: "blue",
      icon: "trend",
      info: "Projetos marcados como Sim em TED de Suporte.",
    },
    {
      label: "Valor Total dos Instrumentos",
      value: fullBrl.format(totals.total),
      tone: "green",
      icon: "money",
      info: "Soma da coluna Valor Total Instrumento Contratual.",
    },
    {
      label: "Recurso Liberado",
      value: fullBrl.format(totals.released),
      tone: "teal",
      icon: "down",
      info: "Total que ja foi disponibilizado para os projetos.",
    },
    {
      label: "Recurso a Receber",
      value: fullBrl.format(totals.receivable),
      tone: "indigo",
      icon: "up",
      info: "Valor previsto que ainda nao foi liberado.",
    },
    {
      label: "Total Realizado",
      value: fullBrl.format(totals.realized),
      tone: "cyan",
      icon: "wallet",
      info: "Soma executada ou gasta pelos projetos.",
    },
    {
      label: "Total Comprometido",
      value: fullBrl.format(totals.committed),
      tone: "violet",
      icon: "piggy",
      info: "Compromissos registrados, ainda nao necessariamente pagos.",
    },
    {
      label: "Saldo Total Atual",
      value: fullBrl.format(totals.balance),
      tone: "rose",
      icon: "arrow",
      info: "Saldo financeiro atual informado na base.",
    },
  ];

  const resetFilters = () =>
    setFilters({
      project: allOption,
      modality: allOption,
      funder: allOption,
      nature: allOption,
      axis: allOption,
      supportTed: allOption,
      instrumentNumber: allOption,
      start: "",
      end: "",
    });

  return (
    <main className="finance-dashboard">
      <section className="page-header" aria-label="Cabeçalho do Painel de Projetos GEREB">
        <div className="page-header__main">
          <div className="page-brand">
            <img src={fiocruzLogo} alt="Fiocruz Brasília" />
          </div>
          <div className="page-title-block">
            <span>Fiocruz Brasília</span>
            <h1>Painel de Projetos GEREB</h1>
            <p>Gerência de Engenharia e Reforma de Edificações</p>
          </div>
          <div className="page-status" aria-label="Atualização do painel">
            <span>Situação em junho/2026</span>
            <strong>{projectCountLabel}</strong>
          </div>
        </div>
      </section>

      <section className="filter-shell" aria-label="Filtros da base GEREB">
        <div className="filter-summary">
          <div>
            <strong>Filtros</strong>
            <span>
              {activeFilterCount
                ? `${activeFilterCount} filtro${activeFilterCount > 1 ? "s" : ""} ativo${activeFilterCount > 1 ? "s" : ""}`
                : "Nenhum filtro ativo"}
            </span>
          </div>
          <button
            type="button"
            className="filter-toggle"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((current) => !current)}
          >
            {filtersOpen ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className={filtersOpen ? "filter-panel is-open" : "filter-panel"}>
        <FilterSelect
          label="Projeto"
          value={filters.project}
          onChange={(value) => updateFilter("project", value)}
          options={projectOptions}
        />
        <FilterSelect
          label="Instrumento"
          value={filters.modality}
          onChange={(value) => updateFilter("modality", value)}
          options={modalityOptions}
        />
        <FilterSelect
          label="Ente financiador"
          value={filters.funder}
          onChange={(value) => updateFilter("funder", value)}
          options={funderOptions}
        />
        <FilterSelect
          label="Natureza"
          value={filters.nature}
          onChange={(value) => updateFilter("nature", value)}
          options={natureOptions}
        />
        <FilterSelect
          label="Eixo estratégico"
          value={filters.axis}
          onChange={(value) => updateFilter("axis", value)}
          options={axisOptions}
        />
        <FilterSelect
          label="Nº instrumento"
          value={filters.instrumentNumber}
          onChange={(value) => updateFilter("instrumentNumber", value)}
          options={instrumentOptions}
        />
        <FilterSelect
          label="TED suporte"
          value={filters.supportTed}
          onChange={(value) => updateFilter("supportTed", value)}
          options={supportOptions}
        />
        <label className="filter-control">
          <span>Início vigência</span>
          <input
            type="date"
            value={filters.start}
            onChange={(event) => updateFilter("start", event.target.value)}
          />
        </label>
        <label className="filter-control">
          <span>Fim vigência</span>
          <input
            type="date"
            value={filters.end}
            onChange={(event) => updateFilter("end", event.target.value)}
          />
        </label>
        <div className="filter-actions">
          <button type="button" onClick={() => setFiltersOpen(false)}>
            Aplicar
          </button>
          <button type="button" onClick={resetFilters}>
            Limpar
          </button>
        </div>
        </div>
      </section>

      <section className="dashboard-summary" aria-label="Resumo da carteira">
        {dashboardCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            info={card.info}
            tone={card.tone}
            icon={card.icon}
            format="text"
          />
        ))}
      </section>
      <section className="dashboard-grid">
        <ResourceDistribution items={resourceItems} />
        <DonutChart
          title="Tipos de Instrumentos"
          info="Mostra a distribuição dos projetos por tipo de instrumento contratual."
          items={instrumentItems}
          detailTitle="Detalhamento"
          showDetailCount
          showDetailFacts={false}
          showDetailTotal
          valueType="count"
        />
      </section>

      <ColumnChart
        title="Realizado, Comprometido e Saldo por Coordenação"
        subtitle="Concentração financeira das coordenações com maior execução"
        info="Compara as coordenações com maior execução para mostrar onde estão concentrados os valores realizados, os compromissos assumidos e os saldos disponíveis."
        groups={coordinationGroups}
      />

      <section className="charts-row">
        <BarList
          title="Projetos por Total Realizado"
          subtitle="Ranking de execução financeira"
          info="Lista os projetos com maior total realizado. Serve para identificar quais projetos mais executaram recursos dentro do filtro selecionado."
          items={topRealizedProjects}
          limit={10}
          expandable
          wideLabels
          fullValues
        />
        <BarList
          title="Projetos por Valor Contratado"
          subtitle="Ranking do valor total do instrumento"
          info="Lista os maiores projetos pelo valor total contratado. Ajuda a separar porte contratual de execução financeira."
          items={topTotalProjects}
          limit={10}
          expandable
          wideLabels
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support">
        <BarList
          title="Ente Financiador"
          subtitle="Valor total contratado por financiador"
          info="Mostra quais entes financiadores concentram o maior valor contratado na carteira filtrada."
          items={funderItems}
          limit={8}
          expandable
          wideLabels
        />
        <DonutChart
          title="Naturezas dos Projetos"
          subtitle="Valor total contratado por natureza"
          info="Mostra como o valor contratado se divide por natureza do projeto, como ensino, pesquisa, extensão e desenvolvimento institucional."
          items={natureItems}
          detailTitle="Detalhamento"
          showDetailCount
          showDetailFacts={false}
          showDetailTotal
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support dashboard-grid--single">
        <AxisOverview
          title="Eixo Mapa Estratégico Fiocruz"
          subtitle="Valor total contratado por eixo"
          info="Organiza o valor contratado pelos eixos estratégicos informados na planilha, ajudando a ver quais temas concentram mais recursos."
          items={axisItems}
          limit={6}
        />
      </section>

      <ProjectTable key={filterKey} projects={filteredProjects} />

      <section className="project-consultation" aria-label="Consulta de projetos">
        <div className="project-consultation__heading">
          <div>
            <h2>Consulta de Projetos</h2>
            <p>Gerência de Engenharia e Reforma de Edificações</p>
          </div>
          <strong>
            {selectedProject ? selectedProject.id : projectCountLabel}
          </strong>
        </div>
        <div className="project-consultation__controls">
          <label className="project-consultation__field">
            <span>Projeto</span>
            <select
              value={filters.project}
              onChange={(event) => updateFilter("project", event.target.value)}
            >
              {projectOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => updateFilter("project", allOption)}
            disabled={filters.project === allOption}
          >
            Limpar consulta
          </button>
        </div>
        <div className="project-consultation__result">
          <article>
            <span>{selectedProject ? "Projeto selecionado" : "Recorte atual"}</span>
            <strong>{selectedProject ? selectedProject.title : "Todos os projetos"}</strong>
          </article>
          <div className="project-consultation__facts">
            <div>
              <span>Coordenação</span>
              <strong>{selectedProject ? selectedProject.unit : projectCountLabel}</strong>
            </div>
            <div>
              <span>Valor total</span>
              <strong>{brl.format(selectedProject ? selectedProject.total : totals.total)}</strong>
            </div>
            <div>
              <span>Realizado</span>
              <strong>{brl.format(selectedProject ? selectedProject.realized : totals.realized)}</strong>
            </div>
            <div>
              <span>Saldo atual</span>
              <strong>{brl.format(selectedProject ? selectedProject.currentBalance : totals.balance)}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default App;
