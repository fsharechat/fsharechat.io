import React from "react"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import BlogPostItem from "@theme/BlogPostItem"
import BlogListPaginator from "@theme/BlogListPaginator"

import type { Props } from "@theme/BlogListPage"

const BlogListPage = ({ metadata, items }: Props) => {
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext()
  const isBlogOnlyMode = metadata.permalink === "/"
  const title = isBlogOnlyMode ? siteTitle : "Blog"
  const { blogDescription } = metadata

  return (
    <Layout title={title} description={blogDescription}>
      <div className="container margin-vert--lg">
        <div className="row">
          <main className="col col--10 col--offset-1">
            {items.map(({ content: BlogPostContent }) => (
              <BlogPostItem
                key={BlogPostContent.metadata.permalink}
                frontMatter={BlogPostContent.frontMatter}
                metadata={BlogPostContent.metadata}
                truncated={BlogPostContent.metadata.truncated}
              >
                <BlogPostContent />
              </BlogPostItem>
            ))}
            <BlogListPaginator metadata={metadata} />
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default BlogListPage
