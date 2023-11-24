import * as core from '@actions/core'
import * as context from './context'
import * as utils from './utils'
import * as kunectlHelper from './kubectlHelper'
import * as cce from './cceCredential'

export async function run() {
    const inputs: context.Inputs = context.getInputs()
    //如果参数输入有问题，终止操作
    if (!utils.checkInputs(inputs)) {
        core.setFailed('check input parameters failed')
        return
    }
    if (!(await kunectlHelper.checkAndInstallKubectl())) {
        core.setFailed('Failed to install kubectl')
        return
    }

    await cce.setK8sConfig(inputs)
}

run().catch(e => core.setFailed(e))
