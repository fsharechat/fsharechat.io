import clsx from "clsx"
import DocusaurusHead from "@docusaurus/Head"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import React from "react"

// import Button from "@theme/Button"
import Layout from "@theme/Layout"
import { MetadataContextProvider } from "@theme/useMetadataContext"

import careersStyles from "../../css/careers.module.css"
import sectionStyles from "../../css/section.module.css"

const CareersPage = () => {
  const title = "社区"
  const description =
    "加入飞享社区,尽享IM资讯"
  const { siteConfig } = useDocusaurusContext()
  // const titleRef = useRef<HTMLHeadingElement | null>(null)
  // const handleClick = useCallback(() => {
  //   titleRef.current?.scrollIntoView({ behavior: "smooth" })
  // }, [titleRef])

  return (
    <MetadataContextProvider>
      <Layout description={description} title={title}>
        <DocusaurusHead>
          <link rel="canonical" href={`${siteConfig.url}/careers/`} />
          <meta
            name="description"
            content="An open source time series SQL database for fast ingestion and queries"
          />
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
              {/* <Button className={careersStyles.card__cta} onClick={handleClick}>
                Current openings
              </Button> */}
            </div>
            <div
              className={clsx(
                careersStyles.card__side,
                careersStyles["card__side--illustration"],
              )}
            >
              <img
                alt="A code editor containing a SQL statement"
                className={careersStyles.card__illustration}
                src="/img/pages/careers/teamCollaboration.svg"
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
                alt="A code editor containing a SQL statement"
                className={careersStyles.card__illustration}
                src="/img/pages/careers/teamSpirit.svg"
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
          {/* <div className={careersStyles.card}>
            <div className={careersStyles.card__side}>
              <h2 className={careersStyles.card__title} ref={titleRef}>
                Current openings
              </h2>
              <p className={careersStyles.card__content}>
                We are always interested in hiring new talent, so if you are
                looking for a role that does is not listed, you can contact us
                anyway! Send your CV with any relevant links (GitHub, LinkedIn,
                personal website, etc.) to{" "}
                <a href="mailto:careers@questdb.io">careers@questdb.io</a>, we
                will review your application and be in touch.
              </p>
            </div>
            <div
              className={clsx(
                careersStyles.card__side,
                careersStyles["card__side--center"],
              )}
            >
              <a className={careersStyles.job} href="technical-content-writer">
                <h3 className={careersStyles.job__title}>
                  Technical Content Writer
                </h3>
                <p className={careersStyles.job__location}>Remote</p>
                <span className={careersStyles.job__cta}>
                  Details&nbsp;
                  <img
                    alt=""
                    src="/img/pages/careers/arrowRight.svg"
                    width="20px"
                  />
                </span>
              </a>
            </div>
          </div> */}
        </section>
      </Layout>
    </MetadataContextProvider>
  )
}

export default CareersPage
