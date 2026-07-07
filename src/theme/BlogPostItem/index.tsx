import React from "react"
import clsx from "clsx"
import { MDXProvider } from "@mdx-js/react"
import Head from "@docusaurus/Head"
import Link from "@docusaurus/Link"
import MDXComponents from "@theme/MDXComponents"
import useBaseUrl from "@docusaurus/useBaseUrl"

import styles from "./styles.module.css"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

type Tag = {
  label: string
  permalink: string
}

// frontmatter 字段名沿用 Docusaurus 原生 BlogPostItem 的下划线/驼峰双写约定，不做 camelCase 改写
/* eslint-disable camelcase */
type FrontMatter = {
  title: string
  author?: string
  author_title?: string
  authorTitle?: string
  author_url?: string
  authorURL?: string
  author_image_url?: string
  authorImageURL?: string
  image?: string
  keywords?: string[]
}
/* eslint-enable camelcase */

type Metadata = {
  date: string
  permalink: string
  tags: Tag[]
  readingTime?: number
  description?: string
}

type Props = {
  children: React.ReactNode
  frontMatter: FrontMatter
  metadata: Metadata
  truncated?: boolean
  isBlogPostPage?: boolean
}

const formatDate = (date: string) => {
  const match = date.substring(0, 10).split("-")
  const year = match[0]
  const month = MONTHS[parseInt(match[1], 10) - 1]
  const day = parseInt(match[2], 10)
  return { year, month, day }
}

const BlogPostItem = (props: Props) => {
  const {
    children,
    frontMatter,
    metadata,
    truncated,
    isBlogPostPage = false,
  } = props
  const { date, permalink, tags, readingTime, description } = metadata
  const { author, title, image, keywords } = frontMatter
  const authorURL = frontMatter.author_url || frontMatter.authorURL
  const authorTitle = frontMatter.author_title || frontMatter.authorTitle
  const authorImageURL =
    frontMatter.author_image_url || frontMatter.authorImageURL
  const imageUrl = useBaseUrl(image, { absolute: true })

  const head = (
    <Head>
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(",")} />
      )}
      {image && <meta property="og:image" content={imageUrl} />}
      {image && <meta property="twitter:image" content={imageUrl} />}
      {image && (
        <meta name="twitter:image:alt" content={`Image for ${title}`} />
      )}
    </Head>
  )

  if (isBlogPostPage) {
    const { year, month, day } = formatDate(date)
    return (
      <>
        {head}
        <article>
          <header>
            <h1 className={clsx("margin-bottom--sm", styles.blogPostTitle)}>
              {title}
            </h1>
            <div className="margin-vert--md">
              <time dateTime={date} className={styles.blogPostDate}>
                {month} {day}, {year}
                {readingTime && <> · {Math.ceil(readingTime)} min read</>}
              </time>
            </div>
            <div className="avatar margin-vert--md">
              {authorImageURL && (
                <a
                  className="avatar__photo-link avatar__photo"
                  href={authorURL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src={authorImageURL} alt={author} />
                </a>
              )}
              <div className="avatar__intro">
                {author && (
                  <>
                    <h4 className="avatar__name">
                      <a
                        href={authorURL}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {author}
                      </a>
                    </h4>
                    <small className="avatar__subtitle">{authorTitle}</small>
                  </>
                )}
              </div>
            </div>
          </header>
          <section className="markdown">
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
          </section>
          {(tags.length > 0 || truncated) && (
            <footer className="row margin-vert--lg">
              {tags.length > 0 && (
                <div className="col">
                  <strong>Tags:</strong>
                  {tags.map(({ label, permalink: tagPermalink }) => (
                    <Link
                      key={tagPermalink}
                      className="margin-horiz--sm"
                      to={tagPermalink}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
              {truncated && (
                <div className="col text--right">
                  <Link
                    to={metadata.permalink}
                    aria-label={`Read more about ${title}`}
                  >
                    <strong>Read More</strong>
                  </Link>
                </div>
              )}
            </footer>
          )}
        </article>
      </>
    )
  }

  const { year, month, day } = formatDate(date)
  const visibleTags = tags.slice(0, 4)

  return (
    <>
      {head}
      <article className={styles.listItem}>
        <div className={styles.listItemMain}>
          <h2 className={styles.listItemTitle}>
            <Link to={permalink}>{title}</Link>
          </h2>
          <div className={styles.listItemMeta}>
            {authorImageURL && (
              <img
                className={styles.listItemAvatar}
                src={authorImageURL}
                alt={author}
              />
            )}
            {author && <span>{author}</span>}
            <span>
              {month} {day}, {year}
            </span>
            {readingTime && <span>{Math.ceil(readingTime)} min read</span>}
            {visibleTags.length > 0 && (
              <span className={styles.listItemTags}>
                {visibleTags.map(({ label, permalink: tagPermalink }) => (
                  <Link
                    key={tagPermalink}
                    className={styles.listItemTag}
                    to={tagPermalink}
                  >
                    {label}
                  </Link>
                ))}
              </span>
            )}
          </div>
          {description && (
            <p className={styles.listItemSummary}>{description}</p>
          )}
        </div>
        {image && (
          <Link to={permalink} className={styles.listItemThumbnailLink}>
            <img
              className={styles.listItemThumbnail}
              src={imageUrl}
              alt={title}
            />
          </Link>
        )}
      </article>
    </>
  )
}

export default BlogPostItem
