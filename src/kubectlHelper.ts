import * as core from '@actions/core'
import * as io from '@actions/io'
import * as cp from 'child_process'
import * as utils from './utils'
import * as context from './context'
import {v4 as uuidv4} from 'uuid'
import * as toolCache from '@actions/tool-cache'
import * as fs from 'fs'
import * as util from 'util'

export async function checkAndInstallKubectl(): Promise<boolean> {
    if (!(await checkKubectlInstall())) {
        await installOrUpdateKubectl()
        return await checkKubectlInstall()
    }
    return true
}
/**
 * 检查sshpass是否已经在系统上完成安装，并输出版本
 * @returns
 */
export async function checkKubectlInstall(): Promise<boolean> {
    const kubectlPath = await io.which('kubectl')
    if (!kubectlPath) {
        core.info('kubectl did not installed or set to the path')
        return false
    }
    core.info('kubectl already installed and set to path: ' + kubectlPath)
    await utils.execCommand(`${kubectlPath} version --client --short`)
    return true
}

/**
 * 到kubectl的release页面获取release版本列表，拿到最新的版本
 * @returns
 */
export async function getLatestKubectlStableVersion(): Promise<string> {
    core.info('latest tag api address ' + context.KUBECTL_LATEST_STABLE_URL)
    const tmpKubectlVersionDownloadDir = './tmp/kubectl/' + uuidv4()
    return await toolCache
        .downloadTool(
            context.KUBECTL_LATEST_STABLE_URL,
            tmpKubectlVersionDownloadDir
        )
        .then(
            kubectlDownloadPath => {
                core.info(
                    'kubectlVersionTmpDownloadPath ' + kubectlDownloadPath
                )
                const kubectlLatestStableVersion = fs
                    .readFileSync(kubectlDownloadPath, 'utf8')
                    .toString()
                    .trim()
                if (!kubectlLatestStableVersion) {
                    return context.KUBECTL_STABLE_VERSION
                }
                core.info(
                    'latest kubectl version ' + kubectlLatestStableVersion
                )
                return kubectlLatestStableVersion
            },
            error => {
                core.info('error ' + error)
                core.warning(
                    util.format(
                        'Failed to read latest kubectl verison from %s. Using default stable version %s',
                        context.KUBECTL_LATEST_STABLE_URL,
                        context.KUBECTL_STABLE_VERSION
                    )
                )
                return context.KUBECTL_STABLE_VERSION
            }
        )
}

/**
 * 根据当前平台计算出需要下载的Kubectl下载地址
 * 完成软件包下载当前临时目录
 * 将软件包拷贝到 /usr/local/bin/kubectl
 * 将软件包的权限设置为755
 */
export async function installOrUpdateKubectl() {
    const osArch = utils.getOSArch()
    const osPlatform = utils.getOSPlatform()
    const installName = utils.getKubectlNameByPlatform(osPlatform)
    core.info(
        'osArch : ' +
            osArch +
            ' osPlatform : ' +
            osPlatform +
            ' installName : ' +
            installName
    )
    if (
        !context.osSupportArchs.includes(osArch) ||
        !context.osSupportPlatforms.includes(osPlatform)
    ) {
        core.info('kubectl can not install on this platform or arch')
        return
    }
    const currentArch = utils.getOSArch4Kubectl(osArch)
    const kubectlLatestStableVersion = await getLatestKubectlStableVersion()
    const kubectlDownloadUrl = getKubectlLatestStableDownloadUrl(
        kubectlLatestStableVersion,
        osPlatform,
        currentArch,
        installName
    )
    const kubectlDownloadPath = await getKubectlDownlodPath(kubectlDownloadUrl)
    if (utils.checkParameterIsNull(kubectlDownloadPath)) {
        core.info('download kubectl failed')
        return
    }
    if (osPlatform === 'win32') {
        await utils.execCommand(
            'copy ' +
                kubectlDownloadPath +
                ' ' +
                context.WINDOWS_KUBECTL_INSTALL_PATH +
                '/' +
                context.WINDOWS_KUBECTL_INSTALL_NAME
        )
    } else {
        await utils.execCommand(
            'sudo cp ' +
                kubectlDownloadPath +
                ' ' +
                context.LINUX_KUBECTL_INSTALL_PATH +
                '/' +
                context.LINUX_KUBECTL_INSTALL_NAME
        )
        await utils.execCommand(
            'sudo chmod ' +
                context.LINUX_KUBECTL_MOD +
                ' ' +
                context.LINUX_KUBECTL_INSTALL_PATH +
                '/' +
                context.LINUX_KUBECTL_INSTALL_NAME
        )
    }

    fs.rmSync(kubectlDownloadPath)
    core.info(
        'install or update new kubect version : ' +
            (await utils.execCommand(
                'which kubectl && kubectl version --client --short'
            ))
    )
}

/**
 * 根据URL下载最新版本的kubect
 * @param kubectlDownloadUrl
 * @returns
 */
export async function getKubectlDownlodPath(
    kubectlDownloadUrl: string
): Promise<string> {
    const tmpKubectlDownloadDir = './tmp/kubectl'
    const tmpKubectlDownloadPath =
        tmpKubectlDownloadDir +
        '/' +
        kubectlDownloadUrl.substring(kubectlDownloadUrl.lastIndexOf('/') + 1)
    let kubectlDownloadPath = ''
    try {
        core.info(
            'download kubectl for install or update from ' + kubectlDownloadUrl
        )
        kubectlDownloadPath = await toolCache.downloadTool(
            kubectlDownloadUrl,
            tmpKubectlDownloadPath
        )
    } catch (error) {
        core.info(
            'Failed to download kubectl from ' +
                kubectlDownloadUrl +
                ' error info ' +
                error
        )
    }
    core.info(kubectlDownloadPath)
    return kubectlDownloadPath
}

/**
 * 根据传入的参数，构造kubectl下载链接
 * @param stableVersion
 * @param osPlatform
 * @param osArch
 * @param kubectlName
 * @returns
 */
export function getKubectlLatestStableDownloadUrl(
    stableVersion: string,
    osPlatform: string,
    osArch: string,
    kubectlName: string
): string {
    const kubectlDownloadUrl = util.format(
        context.KUBECTL_DOWNLOAD_URL,
        stableVersion,
        osPlatform,
        osArch,
        kubectlName
    )
    core.info(
        'download kubectl version : ' +
            stableVersion +
            ' for current ' +
            osArch +
            ' platform ' +
            osPlatform +
            ',download url ' +
            kubectlDownloadUrl
    )
    return kubectlDownloadUrl
}
