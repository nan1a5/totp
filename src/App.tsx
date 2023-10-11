import React, { useEffect } from 'react';
import './App.css';
import RingProgress from './components/RingProgress';
import { getHmacKey } from './utils/HMAC';
import { CodeGenerate } from './utils/CodeGenerate';
import { BsArrowRight, BsBoxArrowRight } from 'react-icons/bs';
import Login from './components/Login';
import toast, { Toaster } from 'react-hot-toast';
import { Request } from './utils/request';

function App() {
  const [code, setCode] = React.useState('');
  const [init, setInit] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [request, setRequest] = React.useState<Request | null>(null);
  // const [serverCode, setServerCode] = React.useState('');

  const serverCode = 'i6UIUGek3pizDYEtKPcJq1i0yFwzSTsk';
  const clientCode = 'J5YK8hTNbCb5uYIniGScC55EaTniFiOz';

  const handleLogin = (username: string) => {
    setUsername(username);
    // 将username存入localStorage
    if(!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }
    toast(`欢迎登录,${username}`, {
      icon: '👋',
      style: {
        borderRadius: '10px',
        color: '#0099CC',
      },
    });


    //@TODO  第一次登录时请求获取servercode,并生成hmacKey
    request?.getServerCode('nan1a5', clientCode).then((serverCode) => {
      // setServerCode(serverCode);
      getHmacKey(serverCode, clientCode).then((res) => {
        // 将res存入localStorage
        if(!localStorage.getItem('hmacKey')) {
          localStorage.setItem('hmacKey', res);
        }
  
        setInit(true);
  
        CodeGenerate.totpCode(6, res, 30, Date.now()).then((code) => {
          setCode(code);
        });
        setInterval(() => {
          CodeGenerate.totpCode(6, res, 30, Date.now()).then((_code) => {
            setCode(
              _code
            )
          });
        }, 1000);
      });
    });
  }

  // 初始化时先获取hmackey,然后循环生成code
  useEffect(() => {

    if(!request) {
      const request = new Request();
      setRequest(request);
    }

    const localHmacKey = localStorage.getItem('hmacKey');
    const username = localStorage.getItem('username');

    if (username && localHmacKey) {
      setInit(true);
      setUsername(username);

      toast(`欢迎回来,${username}`, {
        icon: '👋',
        style: {
          borderRadius: '10px',
          color: '#0099CC',
          },
      });

      CodeGenerate.totpCode(6, localHmacKey, 30, Date.now()).then((code) => {
        setCode(code);
      });
      setInterval(() => {
        CodeGenerate.totpCode(6, localHmacKey, 30, Date.now()).then((_code) => {
          setCode(
            _code
          )
        });
      }, 1000);
      return;
    } else {

      setInit(false);

      // getHmacKey(serverCode, clientCode).then((res) => {
      //   // 将res存入localStorage
      //   if(!localStorage.getItem('hmacKey')) {
      //     localStorage.setItem('hmacKey', res);
      //   }

      //   CodeGenerate.totpCode(6, res, 30, Date.now()).then((code) => {
      //     setCode(code);
      //   });
      //   setInterval(() => {
      //     CodeGenerate.totpCode(6, res, 30, Date.now()).then((_code) => {
      //       setCode(
      //         _code
      //       )
      //     });
      //   }, 1000);
      // });
    }
  }, []);

  return (
    <div className="App">
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
      <div className='wrapper'>
        <div className={`content ${init?'active':''}`}>
          <Login
            cb={handleLogin}
          />
          <div className='code-view'>
            <RingProgress 
              code={code} 
            />
            <div className="button_groups">
            <button onClick={
              // 退出登录
              () => {
                localStorage.removeItem('username');
                localStorage.removeItem('hmacKey');
                setInit(false);
              }
            }>
              退出登录<BsBoxArrowRight />
            </button>
              <button onClick={
                // 新建窗口跳转到验证页面
                () => {
                  window.open(`https://totp.wuliaomj.com/check`);
                }
              }>跳转验证<BsArrowRight /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
