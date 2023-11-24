import * as core from '@actions/core'
import * as context from './context'
import * as os from 'os'
import * as cp from 'child_process'

/**
 * 检查输入的各参数是否正常
 * @param inputs
 * @returns
 */
export function checkInputs(inputs: context.Inputs): boolean {
    if (
        checkParameterIsNull(inputs.ak) ||
        checkParameterIsNull(inputs.sk) ||
        checkParameterIsNull(inputs.region) ||
        checkParameterIsNull(inputs.project_id) ||
        checkParameterIsNull(inputs.cluster_id)
    ) {
        core.info('Please fill all the required parameters')
        return false
    }

    if (!context.cceSupportRegions.includes(inputs.region)) {
        core.info('CCE not support in this region: ' + inputs.region)
        return false
    }

    return true
}

/**
 * 判断字符串是否为空
 * @param parameter
 * @returns
 */
export function checkParameterIsNull(parameter: string): boolean {
    return (
        parameter === undefined ||
        parameter === null ||
        parameter === '' ||
        parameter.trim().length == 0
    )
}

/**
 * 系统平台:x64,arm64
 * @returns
 */
export function getOSArch(): string {
    const osArch = os.arch()
    core.info('Current system arch is ' + osArch)
    return osArch
}

export function getOSPlatform(): string {
    const osPlatform = os.platform()
    core.info('Current system platform is ' + osPlatform)
    return osPlatform
}

export function getOSArch4Kubectl(osArch: string): string {
    return osArch === 'x64' ? 'amd64' : osArch
}

export function getOSPlatform4Kubectl(osPlatform: string) {
    return osPlatform === 'win32' ? 'windows' : osPlatform
}

export function getKubectlNameByPlatform(osPlatform: string): string {
    return osPlatform === 'win32'
        ? context.WINDOWS_KUBECTL_INSTALL_NAME
        : context.LINUX_KUBECTL_INSTALL_NAME
}

/**
 * 执行传入的命令，返回执行结果
 * @param command
 */
export async function execCommand(command: string): Promise<string> {
    const execCommandResult = await (cp.execSync(command) || '').toString()
    core.info(execCommandResult)
    return execCommandResult
}
