import clsx from "clsx"
import DocusaurusHead from "@docusaurus/Head"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import React from "react"

import Layout from "@theme/Layout"
import { MetadataContextProvider } from "@theme/useMetadataContext"

import careersStyles from "../../css/careers.module.css"
import sectionStyles from "../../css/section.module.css"

const CommunityPage = () => {
  const title = "社区"
  const description = "加入飞享社区,尽享IM资讯"
  const { siteConfig } = useDocusaurusContext()

  return (
    <MetadataContextProvider>
      <Layout description={description} title={title}>
        <DocusaurusHead>
          <link rel="canonical" href={`${siteConfig.url}/community/`} />
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
                关注公众号
              </h1>
              <p className={careersStyles.card__content}>
                扫描关注飞享即时通讯IM公众号,获取飞享相关更新日志与相关的技术架构,分享IM相关技术实现
              </p>
            </div>
            <div
              className={clsx(
                careersStyles.card__side,
                careersStyles["card__side--illustration"],
              )}
            >
              <img
                alt="飞享IM 官方公众号二维码"
                className={careersStyles.card__illustration}
                src="https://media.fsharechat.cn/minio-bucket-image-name/wx-qr.png"
              />
            </div>
          </div>
          <div
            className={clsx(careersStyles.card, careersStyles["card--reverse"])}
          >
            <div
              className={clsx(
                careersStyles.card__side,
                careersStyles["card__side--illustration"],
                careersStyles["card__side--baseline"],
              )}
            >
              <img
                alt="飞享IM QQ交流群二维码"
                className={careersStyles.card__illustration}
                src="https://media.fsharechat.cn/minio-bucket-image-name/qq-group.png"
              />
            </div>
            <div className={careersStyles.card__side}>
              <h2 className={careersStyles.card__title}>QQ群交流</h2>
              <p className={careersStyles.card__content}>
                扫码加入飞享即时通讯交流组
              </p>
              <ul className={careersStyles.list}>
                <li className={careersStyles.list__item}>
                  随时获取最新的功能更新
                </li>
                <li className={careersStyles.list__item}>
                  专业的IM相关的技术交流
                </li>
                <li className={careersStyles.list__item}>
                  加群主好友,获取商业支持
                </li>
                <li className={careersStyles.list__item}>
                  及时获取飞享即时通讯IM的相关规划与相关资讯
                </li>
              </ul>
            </div>
          </div>
        </section>
      </Layout>
    </MetadataContextProvider>
  )
}

export default CommunityPage
