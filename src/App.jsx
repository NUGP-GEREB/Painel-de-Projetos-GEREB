import { useMemo, useState } from "react";
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
const monitoredProjectCount = 127;
const supportOptions = [allOption, "Sim", "Não"];

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

const strategicAxisItems = [
  {
    label: "Atenção, Promoção, Vigilâncias, Geração de Conhecimentos e Formação para o SUS",
    value: 1005587479.05,
  },
  {
    label: "Ciência, Tecnologia, Saúde e Sociedade",
    value: 389364521.01,
  },
  {
    label: "Inovação e Complexo Produtivo em Saúde",
    value: 25092610,
  },
  {
    label: "Saúde e Sustentabilidade Socioambiental",
    value: 2450936.11,
  },
  {
    label: "Saúde, Estado e Cooperação Internacional",
    value: 1050000,
  },
];

function normalizeInstrumentType(value) {
  if (value === "EMENDAS") return "EMENDA PARLAMENTAR";
  return value || "Não informado";
}

function groupInstrumentTypes(items) {
  const groups = new Map();

  items.forEach((project) => {
    if (project.instrumentType === "EMENDAS") return;

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

const coordinationFinancialGroups = [
  { label: "ASSESSORIAS", values: [139200000, 3800000, 1000000] },
  { label: "COLABORATÓRIO", values: [103300000, 5800000, 33000000] },
  { label: "NUSMAD", values: [100700000, 16200000, 25100000] },
  { label: "UNASUS", values: [80700000, 3900000, 13600000] },
  { label: "ANGICOS", values: [58500000, 4500000, 16000000] },
  { label: "CPP", values: [55200000, 5500000, -1500000] },
  { label: "NUGP", values: [48400000, 2700000, 9600000] },
  { label: "NEVS", values: [42700000, 2900000, 11400000] },
  { label: "PALIN", values: [36800000, 5800000, 3600000] },
  { label: "PSAT", values: [20800000, 2900000, 8800000] },
  { label: "EGF", values: [4600000, 300000, 700000] },
  { label: "NUSAME", values: [3800000, 200000, 100000] },
  { label: "NETHIS", values: [2000000, 0, 0] },
  { label: "PEPTS", values: [1300000, 200000, 1300000] },
  { label: "GESTÃO", values: [-1, 200000, -200000] },
];

const realizedProjectRanking = [
  { label: "GEREB-018-FIO-23", value: 96154394.37 },
  { label: "GEREB-013-FIO-21", value: 55240431.98 },
  { label: "GEREB-010-FEX-22", value: 38441183.33 },
  { label: "GEREB-001-FIO-24", value: 35859607.73 },
  { label: "GEREB-019-FIO-23", value: 35735514.92 },
  { label: "GEREB-007-FIO-20", value: 34793040.61 },
  { label: "GEREB-008-FIO-20", value: 31130699.28 },
  { label: "GEREB-023-FIO-23", value: 29709078.8 },
  { label: "GEREB-008-FIO-25", value: 25839398.43 },
  { label: "GEREB-025-FIO-23", value: 24794334.46 },
  { label: "GEREB-031-FIO-23", value: 24050376.31 },
  { label: "GEREB-014-FIO-24", value: 18777328 },
  { label: "GEREB-033-FIO-23", value: 18683402.36 },
  { label: "GEREB-012-FIO-24", value: 18091623.64 },
  { label: "GEREB-006-FIO-25", value: 16425795.35 },
  { label: "GEREB-019-FIO-25", value: 11249894.92 },
  { label: "GEREB-009-FIO-24", value: 11206819.27 },
  { label: "GEREB-037-FIO-23", value: 10161299.06 },
  { label: "GEREB-005-FEX-20", value: 10096134.53 },
  { label: "GEREB-023-FIO-26", value: 7821501.51 },
  { label: "GEREB-046-FIO-24", value: 6596696.71 },
  { label: "GEREB-009-FIO-25", value: 6571955.79 },
  { label: "GEREB-018-FIO-25", value: 6202585.92 },
  { label: "GEREB-023-FIO-24", value: 5845803.14 },
  { label: "GEREB-071-FEX-24", value: 5604702.58 },
  { label: "GEREB-003-FIO-25", value: 4639925.93 },
  { label: "GEREB-036-FIO-23", value: 4573802.85 },
  { label: "GEREB-008-FIO-24", value: 4537505.4 },
  { label: "GEREB-022-FIO-23", value: 4338747.58 },
  { label: "GEREB-055-FIO-24", value: 4312945.39 },
  { label: "GEREB-022-FIO-20", value: 4198991.19 },
  { label: "GEREB-003-FIO-24", value: 3838221.88 },
  { label: "GEREB-061-FIO-24", value: 3771535.32 },
  { label: "GEREB-005-FIO-25", value: 3648996.14 },
  { label: "GEREB-013-FIO-24", value: 3598307.85 },
  { label: "GEREB-029-FIO-23", value: 3575683.58 },
  { label: "GEREB-059-FIO-24", value: 3455240.2 },
  { label: "GEREB-026-FIO-25", value: 3057339.13 },
  { label: "GEREB-001-FIO-23", value: 3025326.49 },
  { label: "GEREB-024-FIO-22", value: 2594849.9 },
  { label: "GEREB-032-FIO-23", value: 2512777.09 },
  { label: "GEREB-031-FIO-24", value: 2493694.24 },
  { label: "GEREB-070-FEX-24", value: 2440646.26 },
  { label: "GEREB-069-FIO-24", value: 2244930.39 },
  { label: "GEREB-009-FEX-22", value: 2196926.98 },
  { label: "GEREB-009-FIO-26", value: 2083985.87 },
  { label: "GEREB-058-FIO-24", value: 2014117.46 },
  { label: "GEREB-014-FIO-25", value: 2002585.35 },
  { label: "GEREB-011-FIO-24", value: 1973991.68 },
  { label: "GEREB-021-FIO-23", value: 1896287.38 },
  { label: "GEREB-029-FIO-25", value: 1811355.98 },
  { label: "GEREB-021-FIO-22", value: 1563874.88 },
  { label: "GEREB-019-FIO-24", value: 1467652.28 },
  { label: "GEREB-063-FIO-24", value: 1415325.49 },
  { label: "GEREB-010-FIO-24", value: 1285564.35 },
  { label: "GEREB-028-FIO-25", value: 1259745.5 },
  { label: "GEREB-027-FIO-24", value: 1190046.33 },
  { label: "GEREB-012-FIO-25", value: 1168251.72 },
  { label: "GEREB-020-FIO-24", value: 1104867.05 },
  { label: "GEREB-032-FIO-25", value: 1071103.28 },
  { label: "GEREB-062-FIO-24", value: 980113.95 },
  { label: "GEREB-008-FIO-26", value: 969320.36 },
  { label: "GEREB-030-FIO-23", value: 870051.5 },
  { label: "GEREB-025-FIO-24", value: 819987.31 },
  { label: "GEREB-051-FIO-24", value: 720235.89 },
  { label: "GEREB-028-FIO-24", value: 674807.52 },
  { label: "GEREB-060-FIO-24", value: 629273.54 },
  { label: "GEREB-030-FIO-25", value: 621031.84 },
  { label: "GEREB-056-FIO-24", value: 619332.76 },
  { label: "GEREB-038-FIO-24", value: 605685.48 },
  { label: "GEREB-002-FIO-24", value: 576582 },
  { label: "GEREB-040-FIO-24", value: 549977.88 },
  { label: "GEREB-007-FIO-25", value: 545967.98 },
  { label: "GEREB-017-FIO-24", value: 525086.04 },
  { label: "GEREB-035-FIO-23", value: 523193.23 },
  { label: "GEREB-002-FIO-23", value: 490149.32 },
  { label: "GEREB-037-FIO-24", value: 476106.7 },
  { label: "GEREB-033-FIO-24", value: 452191.13 },
  { label: "GEREB-001-FIO-25", value: 451630.7 },
  { label: "GEREB-045-FIO-24", value: 450428.56 },
  { label: "GEREB-041-FIO-24", value: 447997.21 },
  { label: "GEREB-018-FIO-24", value: 445868.2 },
  { label: "GEREB-049-FIO-24", value: 442597.31 },
  { label: "GEREB-021-FIO-25", value: 424768.18 },
  { label: "GEREB-027-FIO-25", value: 424240.06 },
  { label: "GEREB-052-FIO-24", value: 420565 },
  { label: "GEREB-013-FIO-25", value: 417632.85 },
  { label: "GEREB-048-FIO-24", value: 413746.45 },
  { label: "GEREB-043-FIO-24", value: 391683.01 },
  { label: "GEREB-023-FEX-25", value: 341920 },
  { label: "GEREB-010-FIO-25", value: 338015.68 },
  { label: "GEREB-053-FIO-24", value: 306723.72 },
  { label: "GEREB-001-FIO-26", value: 301613.28 },
  { label: "GEREB-015-FIO-23", value: 290784.78 },
  { label: "GEREB-005-FIO-26", value: 285297.34 },
  { label: "GEREB-035-FIO-24", value: 269435.32 },
  { label: "GEREB-002-FIO-25", value: 252438.89 },
  { label: "GEREB-030-FIO-24", value: 179898.91 },
  { label: "GEREB-036-FIO-24", value: 153812.89 },
  { label: "GEREB-050-FIO-24", value: 150581.02 },
  { label: "GEREB-039-FIO-24", value: 149874.65 },
  { label: "GEREB-044-FIO-24", value: 131604.52 },
  { label: "GEREB-017-FIO-25", value: 125730.92 },
  { label: "GEREB-025-FEX-25", value: 122619.78 },
  { label: "GEREB-006-FIO-26", value: 100916.22 },
  { label: "GEREB-007-FIO-26", value: 92701.33 },
  { label: "GEREB-020-FIO-25", value: 91028.66 },
  { label: "GEREB-020-FIO-26", value: 83973.01 },
  { label: "GEREB-011-FIO-25", value: 76934.86 },
  { label: "GEREB-021-FIO-26", value: 59158.25 },
  { label: "GEREB-017-FIO-26", value: 48973.07 },
  { label: "GEREB-010-FIO-26", value: 41400 },
  { label: "GEREB-018-FIO-26", value: 29649.32 },
  { label: "GEREB-003-FIO-26", value: 25149.23 },
  { label: "GEREB-012-FIO-26", value: 22088.15 },
  { label: "GEREB-002-FIO-26", value: 17350.94 },
  { label: "GEREB-019-FIO-26", value: 16108.57 },
  { label: "GEREB-015-FIO-26", value: 15902 },
  { label: "GEREB-004-FIO-26", value: 12484.56 },
  { label: "GEREB-014-FIO-26", value: 9737.12 },
  { label: "GEREB-013-FIO-26", value: 8449.39 },
  { label: "GEREB-024-FIO-26", value: 6093.98 },
  { label: "GEREB-011-FIO-26", value: 2586.17 },
  { label: "GEREB-033-FIO-25", value: 0 },
  { label: "GEREB-024-FEX-25", value: 0 },
  { label: "GEREB-022-FIO-26", value: 0 },
  { label: "GEREB-022-FIO-25", value: -3500 },
];

const projectOptions = [allOption, ...projects.map((project) => project.id)];
const modalityOptions = optionList(
  projects.map((project) => project.instrumentType),
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
          project.instrumentType === filters.modality;
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
  const projectCountLabel = activeFilterCount
    ? `${filteredProjects.length} projetos`
    : `${monitoredProjectCount} projetos`;

  const topRealizedProjects = realizedProjectRanking;

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

  const axisItems = strategicAxisItems;

  const coordinationGroups = coordinationFinancialGroups;

  const selectedProject = useMemo(
    () =>
      filters.project === allOption
        ? null
        : projects.find((project) => project.id === filters.project),
    [filters.project],
  );

  const dashboardCards = [
    {
      label: "Projetos Filtrados",
      value: monitoredProjectCount,
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
      value: "R$ 1.465.211.460,06",
      tone: "green",
      icon: "money",
      info: "Soma da coluna Valor Total Instrumento Contratual.",
    },
    {
      label: "Recurso Liberado",
      value: "R$ 639.179.572,37",
      tone: "teal",
      icon: "down",
      info: "Total que ja foi disponibilizado para os projetos.",
    },
    {
      label: "Recurso a Receber",
      value: "R$ 863.684.583,50",
      tone: "indigo",
      icon: "up",
      info: "Valor previsto que ainda nao foi liberado.",
    },
    {
      label: "Total Realizado",
      value: "R$ 667.327.428,72",
      tone: "cyan",
      icon: "wallet",
      info: "Soma executada ou gasta pelos projetos.",
    },
    {
      label: "Total Comprometido",
      value: "R$ 138.499.218,72",
      tone: "violet",
      icon: "piggy",
      info: "Compromissos registrados, ainda nao necessariamente pagos.",
    },
    {
      label: "Saldo Total Atual",
      value: "R$ 122.339.433,51",
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
            <strong>{dashboardCards[0].value} projetos monitorados</strong>
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
          <button type="button">Aplicar</button>
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
        <ResourceDistribution />
        <DonutChart
          title="Tipos de Instrumentos"
          info="Mostra a distribuição dos projetos por tipo de instrumento contratual."
          items={
            instrumentItems.length
              ? instrumentItems
              : [{ label: "Sem dados", value: 1 }]
          }
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
          items={
            natureItems.length ? natureItems : [{ label: "Sem dados", value: 1 }]
          }
          detailTitle="Detalhamento"
          showDetailCount
          showDetailFacts={false}
          showDetailTotal
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support dashboard-grid--single">
        <BarList
          title="Eixo Mapa Estratégico Fiocruz"
          subtitle="Valor total contratado por eixo"
          info="Organiza o valor contratado pelos eixos estratégicos informados na planilha, ajudando a ver quais temas concentram mais recursos."
          items={axisItems}
          limit={6}
          fullValues
          roomyLabels
        />
      </section>

      <ProjectTable projects={filteredProjects} />

      <section className="project-consultation" aria-label="Consulta de projetos">
        <div className="project-consultation__heading">
          <div>
            <h2>Consulta de Projetos</h2>
            <p>Selecione um projeto para aplicar o recorte no painel.</p>
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
