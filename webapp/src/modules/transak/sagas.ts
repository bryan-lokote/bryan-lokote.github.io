import { put, select, takeEvery } from 'redux-saga/effects'
import { Network } from '@dcl/schemas'
import { isMobile } from 'decentraland-dapps/dist/lib/utils'
import { Transak } from 'decentraland-dapps/dist/modules/gateway/transak'
import { ProductsAvailed, TradeType } from 'decentraland-dapps/dist/modules/gateway/transak/types'
import { TransakConfig } from 'decentraland-dapps/dist/modules/gateway/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { config } from '../../config'
import { isNFT } from '../asset/utils'
import { closeAllModals } from '../modal/actions'
import { OPEN_TRANSAK, OpenTransakAction } from './actions'

export function* transakSaga() {
  yield takeEvery(OPEN_TRANSAK, handleOpenTransak)
}

function* handleOpenTransak(action: OpenTransakAction) {
  const { asset } = action.payload
  const transakConfig: TransakConfig = {
    key: config.get('TRANSAK_KEY'),
    env: config.get('TRANSAK_ENV'),
    pusher: {
      appKey: config.get('TRANSAK_PUSHER_APP_KEY'),
      appCluster: config.get('TRANSAK_PUSHER_APP_CLUSTER')
    }
  }
  const tokenId = isNFT(asset) ? asset.tokenId : asset.itemId
  const customizationOptions = {
    contractAddress: asset.contractAddress,
    tradeType: isNFT(asset) ? TradeType.SECONDARY : TradeType.PRIMARY,
    tokenId,
    productsAvailed: ProductsAvailed.BUY,
    isNFT: true,
    // TODO (buy nfts with card): waiting for a fix on Transak Widget
    /* redirectURL: encodeURIComponent(
      `${window.origin}${locations.buyStatusPage(
        isNFT(asset) ? AssetType.NFT : AssetType.ITEM,
        asset.contractAddress,
        tokenId
      )}`
    ), */
    widgetWidth: isMobile() ? undefined : '450px' // To avoid fixing the width of the widget in mobile
  }

  const address: string = yield select(getAddress)

  yield put(closeAllModals())

  new Transak(transakConfig, customizationOptions).openWidget(address, Network.MATIC)
}
