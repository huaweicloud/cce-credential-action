import {v4 as uuidv4} from 'uuid'
import * as fs from 'fs'
import * as core from '@actions/core'
import * as utils from './utils'
import * as util from 'util'
import * as context from './context'
import {BasicCredentials} from '@huaweicloud/huaweicloud-sdk-core'
import {
    CceClient,
    CreateKubernetesClusterCertRequest,
    CertDuration
} from '@huaweicloud/huaweicloud-sdk-cce'

/**
 * 通过CCE SDK获取 kubeconfig，并部署到指定位置
 * @param inputs
 */
export async function setK8sConfig(inputs: context.Inputs) {
    const creResult = await getCCECredential(inputs)
    if (utils.checkParameterIsNull(creResult)) {
        core.setFailed('get kubeconfig error')
        return
    }
    if (
        creResult.indexOf('errorMsg') > -1 ||
        creResult.indexOf('errorCode') > -1
    ) {
        core.setFailed(
            'Failed to get kubeconfig by CCE SDK,error message ' + creResult
        )
        return
    }
    await utils.execCommand('mkdir -p ./tmp')
    const kubeconfigPath = './tmp/kubeconfig_' + uuidv4()
    core.info(`Writing kubeconfig contents to ${kubeconfigPath}`)
    fs.writeFileSync(kubeconfigPath, creResult)
    fs.chmodSync(kubeconfigPath, context.KUBECONFIG_MODE)
    core.setSecret(kubeconfigPath)
    core.exportVariable('KUBECONFIG', kubeconfigPath)
    console.log('KUBECONFIG environment variable is set')
    await installKubeConfig(kubeconfigPath)
}

/**
 * 将kubeconfig部署到指定位置
 * 执行简单命令检查kubectl是否可以连接上远端的k8s集群
 * @param kubeconfigPath
 */
export async function installKubeConfig(kubeconfigPath: string) {
    const installCommand = util.format(
        context.KUBECONFIG_INSTALL_COMMAND,
        kubeconfigPath
    )
    await utils.execCommand(installCommand)
    console.log('kubectl config is already set')
    const viewClustInfo =
        'kubectl cluster-info'
    await utils.execCommand(viewClustInfo)
}
/**
 * 调用CCE SDK获取CCE集群的kubeconfig
 * @param inputs
 * @returns
 */
export async function getCCECredential(inputs: context.Inputs) {
    const endpoint = util.format(context.CCE_ENDPOINT, inputs.region)
    const credentials = new BasicCredentials()
        .withAk(inputs.ak)
        .withSk(inputs.sk)
        .withProjectId(inputs.project_id)
    const client = CceClient.newBuilder()
        .withCredential(credentials)
        .withEndpoint(endpoint)
        .withOptions({customUserAgent: context.CUSTOM_USER_AGENT_CCE})
        .build()
    const request = new CreateKubernetesClusterCertRequest()
    request.clusterId = inputs.cluster_id
    const body = new CertDuration()
    body.withDuration(1)
    request.withBody(body)
    try {
        const result = await client.createKubernetesClusterCert(request)
        return JSON.stringify(result)
    } catch (error) {
        core.error(JSON.stringify(error))
        return ''
    }
}
