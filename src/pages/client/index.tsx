import clsx from "clsx"
import DocusaurusHead from "@docusaurus/Head"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import React from "react"

import Layout from "@theme/Layout"
import { MetadataContextProvider } from "@theme/useMetadataContext"

import careersStyles from "../../css/careers.module.css"
import sectionStyles from "../../css/section.module.css"

const AndroidClientPage = () => {
  const title = "Android客户端下载 - 飞享IM"
  const description = "下载飞享IM Android客户端,支持一对一及群组音视频通话"
  const { siteConfig } = useDocusaurusContext()

  return (
    <MetadataContextProvider>
      <Layout description={description} title={title}>
        <DocusaurusHead>
          <link rel="canonical" href={`${siteConfig.url}/client/`} />
          <meta name="description" content={description} />
        </DocusaurusHead>
        <section
          className={clsx(
            sectionStyles["section--inner"],
            careersStyles.section,
          )}
        >
          <div className={careersStyles.card}>
            <div className={careersStyles.card__side}>
              <h1 className={careersStyles["card__title--important"]}>
                Android 客户端
              </h1>
              <p className={careersStyles.card__content}>
                支持一对一视频通过，群组视频通话
              </p>
              <p className={careersStyles.card__cta}>扫描右侧二维码下载</p>
            </div>
            <div
              className={clsx(
                careersStyles.card__side,
                careersStyles["card__side--illustration"],
              )}
            >
              <img
                alt="飞享IM Android客户端下载二维码"
                className={careersStyles.card__illustration}
                src="https://media.fsharechat.cn/minio-bucket-image-name/fsharechat-android-release-apk.png"
              />
            </div>
          </div>
        </section>
      </Layout>
    </MetadataContextProvider>
  )
}

export default AndroidClientPage
