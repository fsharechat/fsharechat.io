import clsx from "clsx"
import React, { ReactNode } from "react"
import Head from "@docusaurus/Head"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import useBaseUrl from "@docusaurus/useBaseUrl"

import UserPreferencesProvider from "@theme/UserPreferencesProvider"
import AnnouncementBar from "@theme/AnnouncementBar"
import Navbar from "@theme/Navbar"
import Footer from "@theme/Footer"

import styles from "./styles.module.css"

export type Props = {
  children: ReactNode
  flex: boolean
  title?: string
  noFooter?: boolean
  description: string
  image?: string
  permalink?: string
  wrapperClassname?: string
}

const Layout = ({
  children,
  flex,
  title,
  noFooter,
  description,
  image,
  permalink,
  wrapperClassname,
}: Props) => {
  const { siteConfig } = useDocusaurusContext()
  const {
    title: siteTitle,
    themeConfig: { image: defaultImage },
    url: siteUrl,
  } = siteConfig
  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const metaImage = image || defaultImage
  const metaImageUrl = useBaseUrl(metaImage, { absolute: true })
  // 服务器会把不带斜杠的 URL 301 到带斜杠的版本，canonical 必须与之一致
  const canonicalUrl =
    permalink &&
    siteUrl + (permalink.endsWith("/") ? permalink : `${permalink}/`)

  return (
    <UserPreferencesProvider>
      <Head>
        <title>{metaTitle}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {description && <meta name="description" content={description} />}
        <meta property="og:image" content={metaImageUrl} />
        <meta property="og:url" content={canonicalUrl || siteUrl} />
        <meta property="og:title" content={metaTitle} />
        {description && (
          <meta property="og:description" content={description} />
        )}
        <meta name="twitter:image" content={metaImageUrl} />
        {description && (
          <meta name="twitter:description" content={description} />
        )}
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:image:alt" content={`Image for "${metaTitle}"`} />
      </Head>
      <AnnouncementBar />
      <Navbar />
      <div
        className={clsx(styles.wrapper, wrapperClassname, {
          [styles.flex]: flex,
        })}
      >
        {children}
      </div>
      {!noFooter && <Footer />}
    </UserPreferencesProvider>
  )
}

Layout.defaultProps = { flex: false }

export default Layout
