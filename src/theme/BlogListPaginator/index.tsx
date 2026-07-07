import React from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"

import styles from "./styles.module.css"

type Props = {
  metadata: {
    previousPage?: string | null
    nextPage?: string | null
  }
}

const BlogListPaginator = ({ metadata }: Props) => {
  const { previousPage, nextPage } = metadata
  return (
    <nav
      className={clsx("pagination-nav", styles.paginationNav)}
      aria-label="博客列表页导航"
    >
      <div className="pagination-nav__item">
        {previousPage && (
          <Link className="pagination-nav__link" to={previousPage}>
            <h4 className="pagination-nav__label">&laquo; 更新的文章</h4>
          </Link>
        )}
      </div>
      <div className="pagination-nav__item pagination-nav__item--next">
        {nextPage && (
          <Link className="pagination-nav__link" to={nextPage}>
            <h4 className="pagination-nav__label">更早的文章 &raquo;</h4>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default BlogListPaginator
