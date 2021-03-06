import clsx from "clsx"
import { differenceInDays, format, formatDistanceToNowStrict } from "date-fns"
import DocusaurusHead from "@docusaurus/Head"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import { usePluginData } from "@docusaurus/useGlobalData"
import React, { ReactNode, useEffect, useState } from "react"

// import CodeBlock from "@theme/CodeBlock"
import Button from "@theme/Button"
import IdealImage from "@theme/Image"
import Layout from "@theme/Layout"
import { MetadataContextProvider } from "@theme/useMetadataContext"

import Console from "../../static/img/pages/getStarted/fsharechat.png"
import { getAssets, getOs, Os, Release } from "../utils"
import binaryStyles from "../css/binary.module.css"
// import instructionStyles from "../css/instruction.module.css"
import sectionStyles from "../css/section.module.css"
import getStartedStyles from "../css/getStarted.module.css"

type BinaryProps = Readonly<{
  architecture: boolean
  basis: string
  children?: ReactNode
  grow: number
  href?: string
  logo: ReactNode
  rt: boolean
  size?: string
  title: string
}>

const Binary = ({
  architecture,
  basis,
  children,
  grow,
  href,
  logo,
  rt,
  size,
  title,
}: BinaryProps) => {
  const hasDetails = Boolean(architecture || rt || size)

  return (
    <section className={clsx(binaryStyles.binary)}>
      <div
        className={binaryStyles.binary__expand}
        style={{ flexBasis: basis }}
      />

      {logo}

      <h3
        className={clsx(binaryStyles.binary__title, {
          [binaryStyles["binary__title--grow"]]: !hasDetails,
        })}
        style={{ flexGrow: grow }}
      >
        {title}
      </h3>

      {hasDetails && (
        <p className={binaryStyles.binary__details}>
          {architecture && (
            <span
              className={clsx("color--pink", binaryStyles.binary__architecture)}
            >
              64-bit
            </span>
          )}

          <span className={binaryStyles.binary__size}>
            {rt && " rt -"}
            {size && ` ${size}`}
          </span>
        </p>
      )}

      {href && (
        <Button
          className={binaryStyles.binary__download}
          href={href}
          newTab={false}
          variant="tertiary"
        >
          Download
        </Button>
      )}

      {children}
    </section>
  )
}

Binary.defaultProps = {
  architecture: false,
  basis: "auto",
  grow: 0,
  rt: false,
}

const GetStartedPage = () => {
  const title = "下载飞享客户端"
  const description = "下载飞享, 你身边的IM的通讯专家"
  const { siteConfig } = useDocusaurusContext()
  const { release } = usePluginData<{ release: Release }>("fetch-release")
  const [os, setOs] = useState<Os | undefined>()
  const [releaseDate, setReleaseDate] = useState(
    format(new Date(release.published_at), "MMMM M, yyyy"),
  )
  const assets = getAssets(release)

  useEffect(() => {
    const isClient = typeof window !== "undefined"

    if (!isClient) {
      return
    }

    if (differenceInDays(new Date(), new Date(release.published_at)) < 31) {
      setReleaseDate(
        `${formatDistanceToNowStrict(new Date(release.published_at))} ago`,
      )
    }
    setOs(getOs())
  }, [release.published_at])

  const perOs = {
    bsd: (
      <Binary
        architecture
        href={assets.bsd.href}
        logo={
          <img
            alt="BSD Logo"
            className={binaryStyles.binary__logo}
            src="/img/pages/getStarted/bsd.svg"
          />
        }
        rt
        size={assets.bsd.size}
        title="FreeBSD"
      />
    ),
    linux: (
      <Binary
        architecture
        href={assets.linux.href}
        logo={
          <img
            alt="Linux Logo"
            className={binaryStyles.binary__logo}
            src="/img/pages/getStarted/linux.svg"
          />
        }
        rt
        size={assets.linux.size}
        title="Linux"
      />
    ),
    macos: (
      <Binary
        architecture
        href={assets.macos.href}
        logo={
          <img
            alt="macOS Logo"
            className={binaryStyles.binary__logo}
            src="/img/pages/getStarted/macos.svg"
          />
        }
        rt
        size={assets.macos.size}
        title="macOS"
      />
    ),
    windows: (
      <Binary
        architecture
        href={assets.windows.href}
        logo={
          <img
            alt="Windows Logo"
            className={binaryStyles.binary__logo}
            src="/img/pages/getStarted/windows.svg"
          />
        }
        rt
        size={assets.windows.size}
        title="Windows"
      />
    ),
  }

  useEffect(() => {
    const isClient = typeof window !== "undefined"

    if (!isClient) {
      return
    }

    setOs(getOs())
  }, [])

  return (
    <MetadataContextProvider>
      <Layout description={description} title={title}>
        <DocusaurusHead>
          <link rel="canonical" href={`${siteConfig.url}/getstarted/`} />
          <meta name="description" content={description} />
        </DocusaurusHead>
        <section
          className={clsx(
            sectionStyles["section--inner"],
            getStartedStyles.getStarted,
          )}
        >
          <div className={getStartedStyles.getStarted__top}>
            <h1
              className={clsx(
                sectionStyles.section__title,
                getStartedStyles.getStarted__title,
              )}
            >
              开始下载体验飞享
            </h1>

            <p
              className={clsx(
                sectionStyles.section__subtitle,
                getStartedStyles.getStarted__subtitle,
                "text--center",
              )}
            >
              点击下载按钮,下载最新版本({siteConfig.customFields.version})
              下载成功你可以使用体验帐号登录体验
            </p>

            <IdealImage
              alt="Screenshot of the Web Console showing various SQL statements and the result of one as a chart"
              className={clsx(
                "screenshot--shadow",
                getStartedStyles.getStarted__console,
              )}
              img={Console}
              src="/img/pages/getStarted/fsharechat.png"
            />

            <div className={getStartedStyles.getStarted__cta}>
              <p
                className={clsx(getStartedStyles.getStarted__details, {
                  [getStartedStyles["getStarted__details--download"]]:
                    os !== "macos",
                })}
              >
                最新版本:&nbsp;
                <span className="color--pink">
                  {siteConfig.customFields.version}
                </span>
                &nbsp;({releaseDate})
              </p>
              {os && os !== "macos" && assets[os] && (
                <Button href={assets[os].href} newTab={false}>
                  {os}&nbsp;Download
                </Button>
              )}
            </div>

            <div className={getStartedStyles.getStarted__links}>
              <a
                className={getStartedStyles.getStarted__link}
                href={release.html_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                查看更新日志
              </a>
              <a
                className={getStartedStyles.getStarted__link}
                href={`${siteConfig.customFields.githubUrl}/tags`}
                rel="noopener noreferrer"
                target="_blank"
              >
                查看旧版本
              </a>
            </div>
          </div>
        </section>

        <div className={binaryStyles.binaries}>
          {os ? (
            <>
              {perOs[os]}
              {os !== "linux" && perOs.linux}
              {os !== "macos" && perOs.macos}
              {os !== "windows" && perOs.windows}
              {/* {os !== "bsd" && perOs.bsd} */}
            </>
          ) : (
            <>
              {perOs.linux}
              {perOs.macos}
              {perOs.windows}
              {/* {perOs.bsd} */}
            </>
          )}
          {/* <Binary
            architecture
            href={assets.noJre.href}
            logo={
              <img
                alt="Planet with wings"
                className={binaryStyles.binary__logo}
                src="/img/pages/getStarted/nojre.svg"
              />
            }
            size={assets.noJre.size}
            title="Any (no JVM)"
          />
          <Binary
            basis="40px"
            grow={1}
            logo={
              <img
                alt="Docker logo"
                className={binaryStyles.binary__logo}
                src="/img/pages/getStarted/docker.svg"
              />
            }
            title="Docker"
          >
            <CodeBlock className="language-shell">
              docker run -p 9000:9000 questdb/questdb
            </CodeBlock>
            <p className={binaryStyles.binaries__description}>
              Documentation on&nbsp;
              <a
                href={siteConfig.customFields.dockerUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Docker Hub
              </a>
            </p>
          </Binary>
          <Binary
            grow={1.1}
            logo={
              <img
                alt="Helm logo"
                className={binaryStyles.binary__logo}
                src="/img/pages/getStarted/helm.svg"
              />
            }
            title="Kubernetes (via Helm)"
          >
            <CodeBlock className="language-shell">
              {`helm repo add questdb https://helm.${siteConfig.customFields.domain}/
helm install questdb/questdb --version ${siteConfig.customFields.helmVersion}`}
            </CodeBlock>
            <p className={binaryStyles.binaries__description}>
              Documentation on&nbsp;
              <a
                href={siteConfig.customFields.artifactHubUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                ArtifactHub
              </a>
            </p>
          </Binary>
          <Binary
            grow={0.5}
            logo={
              <img
                alt="Maven logo"
                className={binaryStyles.binary__logo}
                src="/img/pages/getStarted/maven.svg"
              />
            }
            title="Maven"
          >
            <CodeBlock className="language-xml">
              {`<dependency>
  <groupId>org.questdb</groupId>
  <artifactId>questdb</artifactId>
  <version>${siteConfig.customFields.version}</version>
</dependency>`}
            </CodeBlock>
          </Binary>
          <Binary
            grow={2}
            logo={
              <img
                alt="Gradle logo"
                className={binaryStyles.binary__logo}
                src="/img/pages/getStarted/gradle.svg"
              />
            }
            title="Gradle"
          >
            <CodeBlock className="language-shell">
              {`implementation 'org.questdb:questdb:${siteConfig.customFields.version}'`}
            </CodeBlock>
            <div style={{ height: "2.75rem" }} />
          </Binary> */}
        </div>

        {/* <div className={instructionStyles.instructions}>
          <img
            alt="SQL statement in a code editor with an artistic view of the query result shown as a chart and a table"
            className={instructionStyles.instructions__illustration}
            src="/img/pages/getStarted/query.svg"
          />

          <div className={instructionStyles.instructions__text}>
            <h2 className={instructionStyles.instructions__title}>
              How does it work
            </h2>
            <p>
              QuestDB is distributed as a single binary. You can download
              either:
            </p>
            <ul className={instructionStyles.instructions__list}>
              <li className={instructionStyles.instructions__bullet}>
                The &quot;rt&quot; version, this includes a trimmed JVM so you
                do not need anything else (~ {assets.linux.size})
              </li>
              <li className={instructionStyles.instructions__bullet}>
                The binary itself (~ {assets.noJre.size}), without the JVM. In
                this case, you need Java 11 installed locally
              </li>
            </ul>
            <p>
              To find out more about how to use the binaries, please check
              the&nbsp;
              <a href="/docs/guide/binaries/">dedicated documentation</a>.
            </p>
            <p>
              Check out the{" "}
              <a
                href={release.html_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                v{siteConfig.customFields.version} CHANGELOG
              </a>{" "}
              for information on the latest release.
            </p>
          </div>
        </div> */}
      </Layout>
    </MetadataContextProvider>
  )
}

export default GetStartedPage
