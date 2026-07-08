import React from "react"
import Layout from "@theme/Layout"
import BlogPostItem from "@theme/BlogPostItem"
import Link from "@docusaurus/Link"

import type { Props } from "@theme/BlogTagsPostsPage"

const pluralize = (count: number, word: string) =>
  count > 1 ? `${word}s` : word

const BlogTagsPostsPage = ({ metadata, items }: Props) => {
  const { allTagsPath, name: tagName, count } = metadata

  return (
    <Layout
      title={`Posts tagged "${tagName}"`}
      description={`Blog | Tagged "${tagName}"`}
    >
      <div className="container margin-vert--lg">
        <div className="row">
          <main className="col col--10 col--offset-1">
            <h1>
              {count} {pluralize(count, "post")} tagged with &quot;{tagName}
              &quot;
            </h1>
            <Link href={allTagsPath}>View All Tags</Link>
            <div className="margin-vert--xl">
              {items.map(({ content: BlogPostContent }) => (
                <BlogPostItem
                  key={BlogPostContent.metadata.permalink}
                  frontMatter={BlogPostContent.frontMatter}
                  metadata={BlogPostContent.metadata}
                  truncated
                >
                  <BlogPostContent />
                </BlogPostItem>
              ))}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default BlogTagsPostsPage
