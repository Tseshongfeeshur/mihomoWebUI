window.port = '9090';
// dev 之后要写获取 port 的逻辑

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const page = params.get('page') || 'home';
// 获取当前 page 参数
goto(page);
// 加载页面

async function goto(page) {
    if (page == 'index') return goto('home');
    // 拦截加载容器，注释位置调整

    // window.onpopstate = function(event) {
    //     return;
    // };
    // 阻断后退行为

    const title = document.getElementById('title');
    const container = document.getElementById('container');
    const nav = document.getElementById('nav');
    // 定义元素

    async function fetchResource(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return await response.text();
        } catch (error) {
            toast(`加载资源失败：${url} - ${error}`);
            return null;
            // 返回 null 表示加载失败
        }
    }
    // 获取子结构
    const subHtml = await fetchResource(`./pages/${page}.html`);
    if (!subHtml) {
        toast('加载页面失败，将返回主页');
        return goto('home');
    }
    // 若无当前页面则返回主页

    const subCss = await fetchResource(`./pages/styles/${page}.css`);
    const subJs = await fetchResource(`./pages/scripts/${page}.js`);

    container.innerHTML = '';
    container.insertAdjacentHTML('beforeend', subHtml);
    if (subCss) {
        const style = document.createElement('style');
        style.innerText = subCss;
        container.appendChild(style);
    }
    if (subJs) {
        const script = document.createElement('script');
        script.textContent = subJs;
        script.async = true;
        document.head.appendChild(script);
    }
    // 填充子结构到容器，添加样式，运行脚本

    nav.value = page;
    // 导航栏同步更新

    // const layoutMain = document.getElementById('layout-main');
    // layoutMain.scrollTop = 0;
    // 滚动到顶部

    const headName = window.pageName || ''; 
    title.innerText = headName;
    document.title = `${headName} | 虚空•仪表盘`;
    // 修改标题（需要在子页面脚本提前定义）

    history.pushState(null, '', `?page=${page}`);
    // 更新地址栏

    window.onpopstate = function(event) {
        goto('home');
    };
    // 设置后退行为
}