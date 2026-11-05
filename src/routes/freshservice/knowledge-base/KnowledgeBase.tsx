import { useState } from 'react';
import ArticleListView from './ArticleListView';
import ArticleTemplates from './ArticleTemplates';
import EmptyState from '../EmptyState';
import KbSidebar from './KbSidebar';
import TrashView from './TrashView';
import noAnalyticsArt from './assets/no-analytics.svg';
import noApprovalsArt from './assets/no-approvals.svg';
import {
  ALL_ARTICLES_BLURB,
  ALL_ARTICLES_TITLE,
  APPROVALS_EMPTY,
  ARTICLES,
  CATEGORY_BLURBS,
  KB_CATEGORIES,
  KB_NAV,
  REVIEW_EMPTY,
} from './kb.data';

/**
 * Solutions > Knowledge Base.
 *
 * A 300px sidebar against the content, the same shape as the AI Agent Studio's
 * sub-nav but wider. Every sidebar row now lands somewhere real: the four fixed
 * views, both categories, both folders, and Trash.
 *
 * The category and folder routes reuse the article table rather than getting
 * their own, because live does the same — a category view is All Articles
 * filtered, plus a search box and a heading that counts what survived.
 */
export default function KnowledgeBase() {
  const [selected, setSelected] = useState(KB_NAV[0].id);

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <KbSidebar selected={selected} onSelect={setSelected} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <KbView id={selected} />
      </div>
    </div>
  );
}

function KbView({ id }: { id: string }) {
  if (id === 'all-articles') {
    return <ArticleListView title={ALL_ARTICLES_TITLE} blurb={ALL_ARTICLES_BLURB} articles={ARTICLES} />;
  }
  if (id === 'article-templates') return <ArticleTemplates />;
  if (id === 'approvals') return <EmptyState art={noApprovalsArt} message={APPROVALS_EMPTY} />;
  if (id === 'articles-to-review') return <EmptyState art={noAnalyticsArt} message={REVIEW_EMPTY} />;
  if (id === 'trash') return <TrashView />;

  // A category shows every article in any of its folders; a folder shows its own.
  const category = KB_CATEGORIES.find((c) => c.id === id);
  if (category) {
    const folders = new Set(category.folders.map((f) => f.label));
    return (
      <ArticleListView
        title={category.label}
        blurb={CATEGORY_BLURBS[category.id]}
        articles={ARTICLES.filter((a) => folders.has(a.folder))}
        showSearch
      />
    );
  }

  const folder = KB_CATEGORIES.flatMap((c) => c.folders).find((f) => f.id === id);
  if (folder) {
    return (
      <ArticleListView
        title={folder.label}
        articles={ARTICLES.filter((a) => a.folder === folder.label)}
        showSearch
      />
    );
  }

  return null;
}
