export interface WeappGetLocationResult {
    /** 经度 */
    longitude: number,
    /** 纬度 */
    latitude: number,
    speed: number,
    accuracy: number
}

export default class WeappUtil {
    private static _lastToastPromise?: Promise<any>;

    /**
     * 类似浏览器的alert
     * await的话会等到点击确认才继续
     */
    static alert(content: string, title: string = '', confirmText: string = '确定'): Promise<void> {
        let promiseFunc = (rs: Function, rj: Function) => {
            // 兼容浏览器
            if (typeof wx == 'undefined' || !wx.showModal) {
                window.alert(content);
                rs();
                return;
            }

            wx.showModal({
                title: title,
                content: content,
                showCancel: false,
                confirmText: confirmText,
                success: () => {
                    rs()
                },
                fail: (err: any) => {
                    rj(err)
                }
            })
        };

        if (this._lastToastPromise) {
            this._lastToastPromise = this._lastToastPromise.then(() => new Promise(promiseFunc));
        }
        else {
            this._lastToastPromise = new Promise(promiseFunc)
        }

        return this._lastToastPromise;
    }

    /**
     * 类似浏览器的confirm
     * await的话会等到点击确认或取消才继续
     * @return true代表点击了确定，false代表点击了取消
     */
    static confirm(content: string, title: string = '', options?: {
        cancelText?: string,
        cancelColor?: string,
        confirmText?: string,
        confirmColor?: string,
    }): Promise<boolean> {
        let promiseFunc = (rs: Function, rj: Function) => {
            // 兼容浏览器
            if (typeof wx == 'undefined' || !wx.showModal) {
                rs(window.confirm(content));
                return;
            }

            wx.showModal(Object.assign({
                title: title,
                content: content,
                success: function (res: any) {
                    if (res.confirm) {
                        rs(true)
                    } else if (res.cancel) {
                        rs(false)
                    }
                },
                fail: (err: any) => {
                    rj(err);
                }
            }, options))
        }

        if (this._lastToastPromise) {
            this._lastToastPromise = this._lastToastPromise.then(() => new Promise(promiseFunc));
        }
        else {
            this._lastToastPromise = new Promise(promiseFunc);
        }
        return this._lastToastPromise;
    }

    /**
     * 下载文件，成功后返回本地临时文件路径
     * @param url 
     */
    static downloadFile(url: string): Promise<string> {
        return new Promise<string>((rs, rj) => {
            wx.downloadFile({
                url: url,
                success: (res: any) => {
                    rs(res.tempFilePath);
                },
                fail: (err: Error) => {
                    wx.showModal({
                        title: '图片下载失败',
                        content: JSON.stringify(err) + ',url:' + url
                    })
                    rj(err)
                }
            })
        })
    }

    /**
     * 获取地理位置
     */
    static async getLocation(): Promise<WeappGetLocationResult> {
        return new Promise<WeappGetLocationResult>((rs, rj) => {
            wx.getLocation({
                type: 'wgs84',
                success: function (res: any) {
                    rs({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        speed: res.speed,
                        accuracy: res.accuracy
                    })
                },
                fail: (e: any) => {
                    rj(e)
                }
            })
        })
    }
}