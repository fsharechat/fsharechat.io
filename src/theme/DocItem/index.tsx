import clsx from "clsx"
import React, { ComponentType } from "react"
import Head from "@docusaurus/Head"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import useBaseUrl from "@docusaurus/useBaseUrl"

import DocPaginator from "@theme/DocPaginator"
import TableOfContents from "@theme/TOC"

import styles from "./styles.module.css"

type PageInfo = {
  permalink: string
  title: string
}

type Metadata = {
  description?: string
  title?: string
  permalink?: string
  editUrl?: string
  lastUpdatedAt?: number
  lastUpdatedBy?: string
  previous?: PageInfo
  next?: PageInfo
}

type Props = {
  content: ComponentType & {
    metadata: Metadata
    frontMatter: {
      image?: string
      keywords?: string[]
    } & { [key: string]: unknown }
    rightToc?: Array<{ value: string; id: string; children: any[] }>
  }
}

// 服务器(Nginx)会把不带斜杠的 URL 301 到带斜杠的版本，
// 因此 canonical 必须统一为带尾斜杠的形式，与 sitemap 保持一致
const withTrailingSlash = (permalink: string) =>
  permalink.endsWith("/") ? permalink : `${permalink}/`

const DocItem = ({ content: DocContent }: Props) => {
  const { siteConfig } = useDocusaurusContext()
  const { url: siteUrl, title: siteTitle } = siteConfig
  const { metadata, frontMatter } = DocContent
  const {
    description,
    title,
    permalink,
    editUrl,
    lastUpdatedAt,
    lastUpdatedBy,
  } = metadata
  const {
    image: metaImage,
    keywords,
    hide_title: hideTitle,
    hide_table_of_contents: hideTableOfContents,
  } = frontMatter
  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const metaImageUrl = useBaseUrl(metaImage, { absolute: true })
  const canonicalUrl = permalink && siteUrl + withTrailingSlash(permalink)

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta property="og:title" content={metaTitle} />
        {description && <meta name="description" content={description} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
        {keywords && keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(",")} />
        )}
        {metaImage && <meta property="og:image" content={metaImageUrl} />}
        {metaImage && <meta property="twitter:image" content={metaImageUrl} />}
        {metaImage && (
          <meta name="twitter:image:alt" content={`Image for "${metaTitle}"`} />
        )}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <div
        className={clsx("container padding-vert--lg", styles.docItemWrapper)}
      >
        <div className="row">
          <div
            className={clsx("col", {
              [styles.docItemCol]: !hideTableOfContents,
            })}
          >
            <div className={styles.docItemContainer}>
              <article>
                {!hideTitle && (
                  <header>
                    <h1 className={styles.docTitle}>{title}</h1>
                  </header>
                )}
                <div className="markdown">
                  <DocContent />
                </div>
              </article>
              {(editUrl || lastUpdatedAt || lastUpdatedBy) && (
                <div className="margin-vert--xl">
                  <div className="row">
                    <div className="col">
                      {editUrl && (
                        <a
                          href={editUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <svg
                            fill="currentColor"
                            height="1.2em"
                            width="1.2em"
                            preserveAspectRatio="xMidYMid meet"
                            viewBox="0 0 40 40"
                            style={{
                              marginRight: "0.3em",
                              verticalAlign: "sub",
                            }}
                          >
                            <g>
                              <path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z" />
                            </g>
                          </svg>
                          Edit this page
                        </a>
                      )}
                    </div>
                    {(lastUpdatedAt || lastUpdatedBy) && (
                      <div className="col text--right">
                        <em>
                          <small>
                            Last updated{" "}
                            {lastUpdatedAt && (
                              <>
                                on{" "}
                                <time
                                  dateTime={new Date(
                                    lastUpdatedAt * 1000,
                                  ).toISOString()}
                                  className={styles.docLastUpdatedAt}
                                >
                                  {new Date(
                                    lastUpdatedAt * 1000,
                                  ).toLocaleDateString()}
                                </time>
                                {lastUpdatedBy && " "}
                              </>
                            )}
                            {lastUpdatedBy && (
                              <>
                                by <strong>{lastUpdatedBy}</strong>
                              </>
                            )}
                            {process.env.NODE_ENV === "development" && (
                              <div>
                                <small>
                                  {" "}
                                  (Simulated during dev for better perf)
                                </small>
                              </div>
                            )}
                          </small>
                        </em>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="margin-vert--lg">
                <DocPaginator metadata={metadata} />
              </div>
            </div>
          </div>
          {!hideTableOfContents && DocContent.rightToc && (
            <div className="col col--3">
              <TableOfContents headings={DocContent.rightToc} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DocItem
