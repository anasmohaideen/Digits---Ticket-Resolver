import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Overview from './routes/Overview';
import Dropdown from './routes/Dropdown';
import Freshservice from './routes/freshservice/Freshservice';
import SectionPage from './routes/freshservice/SectionPage';
import AiAgentStudio from './routes/freshservice/ai-agent-studio/AiAgentStudio';
import Admin from './routes/freshservice/admin/Admin';
import AiInsights from './routes/freshservice/analytics/AiInsights';
import Analytics from './routes/freshservice/analytics/Analytics';
import Assets from './routes/freshservice/assets/Assets';
import Changes from './routes/freshservice/changes/Changes';
import Problems from './routes/freshservice/problems/Problems';
import Services from './routes/freshservice/services/Services';
import PotentialServices from './routes/freshservice/services/PotentialServices';
import Dashboard from './routes/freshservice/dashboard/Dashboard';
import KnowledgeBase from './routes/freshservice/knowledge-base/KnowledgeBase';
import RecommendedTopics from './routes/freshservice/knowledge-base/RecommendedTopics';
import Tickets from './routes/freshservice/tickets/Tickets';
import TicketsBoard from './routes/freshservice/tickets/TicketsBoard';
import TicketsRoute from './routes/freshservice/tickets/TicketsRoute';
import TrGallery from './routes/freshservice/tickets/details/TrGallery';
import { DEFAULT_SECTION, NAV_SECTIONS, childHref } from './routes/freshservice/sections';

/**
 * Group children that have a real page, so the placeholder generator below must
 * not also emit a route for them. Two identical static paths would otherwise be
 * declared and the winner would depend on declaration order.
 */
const BUILT_CHILD_ROUTES = new Set(['solutions/recommended-topics', 'reports-insights/analytics']);

/** `/freshservice/tickets/:id/option-2` → `/freshservice/tickets/:id`. */
function OptionTwoRedirect() {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  return <Navigate to={`/freshservice/tickets/${id}${search}`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* The prototype opens straight on #INC-4127. The old shell is still at /overview. */}
      <Route path="/" element={<Navigate to="/freshservice/tickets/1" replace />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/dropdown" element={<Dropdown />} />
      {/* Dev gallery for the Ticket Resolver Details tab. Outside the
          /freshservice shell, like /dropdown, because it is a component
          catalogue rather than a product screen. */}
      <Route path="/tr-gallery" element={<TrGallery />} />
      <Route path="/freshservice" element={<Freshservice />}>
        <Route index element={<Navigate to={DEFAULT_SECTION} replace />} />
        <Route path="agent-studio">
          <Route index element={<Navigate to="ai-agents" replace />} />
          <Route path=":view" element={<AiAgentStudio />} />
        </Route>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin" element={<Admin />} />
        <Route path="assets" element={<Assets />} />
        <Route path="changes" element={<Changes />} />
        <Route path="problems" element={<Problems />} />
        {/* Services is IT Operations' first child, so it answers at the group's
            own route rather than under it. */}
        <Route path="it-operations" element={<Services />} />
        <Route path="it-operations/potential-services" element={<PotentialServices />} />
        <Route path="solutions">
          <Route index element={<KnowledgeBase />} />
          <Route path="recommended-topics" element={<RecommendedTopics />} />
        </Route>
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/board" element={<TicketsBoard />} />
        {/* The Ticket Resolver detail page. Option 2 won the 21 Oct review, so
            it answers at the plain ticket URL; `TicketDetail.tsx` (Option 1) is
            kept in the repo but no longer routed. */}
        <Route path="tickets/:id" element={<TicketsRoute />} />
        {/* Links shared during the review carried an `/option-2` tail. They
            still open, at the clean URL, with their query string intact. */}
        <Route path="tickets/:id/option-2" element={<OptionTwoRedirect />} />
        <Route path="reports-insights" element={<AiInsights />} />
        <Route path="reports-insights/analytics" element={<Analytics />} />
        {/* Group children with no page yet, as STATIC routes. A generic
            ":section/:child" ranks BELOW "tickets/:id", so /tickets/board was
            resolving to a ticket detail and reporting "No such ticket." */}
        {NAV_SECTIONS.filter((section) => section.children).flatMap((section) =>
          section.children!
            .filter(
              (child) =>
                !child.href &&
                childHref(section, child) !== `/freshservice/${section.id}` &&
                !BUILT_CHILD_ROUTES.has(`${section.id}/${child.id}`)
            )
            .map((child) => (
              <Route
                key={`${section.id}/${child.id}`}
                path={`${section.id}/${child.id}`}
                element={<SectionPage />}
              />
            ))
        )}
        <Route path=":section" element={<SectionPage />} />
      </Route>
    </Routes>
  );
}
