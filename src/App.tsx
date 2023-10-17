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
  const [lastCode, setLastCode] = React.useState(code);
  const [init, setInit] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [intervals, setIntervals] = React.useState<any>();
  const [request, setRequest] = React.useState<Request | null>(null);
  // const [serverCode, setServerCode] = React.useState('');

  const clientCodeLength = 32;
  const serverCode = 'i6UIUGek3pizDYEtKPcJq1i0yFwzSTsk';
  const clientCode = 'J5YK8hTNbCb5uYIniGScC55EaTniFiOz';

  const memoCode = React.useMemo(() => {
    return code;
  }, [code]);

  const getClientCode = (length:number): string => {
    // 生成随机字符串
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(let i = 0; i < length; i++) {
      result += str[Math.floor(Math.random() * str.length)];
    }

    return result;
  }

  const handleLogin = (username: string, cb?:Function) => {
    setUsername(username);
    // 将username存入localStorage
    if(!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }

    //第一次登录时请求获取servercode,并生成hmacKey
    request?.getServerCode(username, getClientCode(clientCodeLength)).then(([serverCode, clientCode]) => {
      console.log('username',username);
      
      // setServerCode(serverCode);
      getHmacKey(serverCode, clientCode).then((res) => {
        // 将res存入localStorage
        if(!localStorage.getItem('hmacKey')) {
          localStorage.setItem('hmacKey', res);
        }
  
        setInit(true);
        cb && cb();

        CodeGenerate.totpCode(6, res, 30, Date.now()).then((_code) => {
          setCode(_code);
        });
        intervals && clearInterval(intervals);

        // const interval = setInterval(() => {
        //   CodeGenerate.totpCode(6, res, 30, Date.now()).then((_code) => {
        //     // setLastCode(code);
        //     setCode(
        //       _code
        //     )
        //   });
        //   setIntervals(interval);
        // }, 600);
        const _interval = setInterval(() => {
          const nextTime = Math.ceil(Date.now() / 1000 / 30) * 30 * 1000;
          const timeDiff = nextTime - Date.now();
          // console.log(timeDiff);   
          if(timeDiff < 800 || timeDiff > 29200) {
            CodeGenerate.totpCode(6, res, 30, Date.now()).then((_code) => {
              setCode(
                _code
              );
            });
          }
        }, 500);
        setIntervals(_interval);
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

      CodeGenerate.totpCode(6, localHmacKey, 30, Date.now()).then((_code) => {
        setCode(_code);      
      });
      intervals && clearInterval(intervals);

      // const _interval = setInterval(() => {
      //   CodeGenerate.totpCode(6, localHmacKey, 30, Date.now()).then((_code) => {
      //     setCode(
      //       _code
      //     );
      //   });
      // }, 600);

      // 大概效率更高点的方法
      const _interval = setInterval(() => {
        const nextTime = Math.ceil(Date.now() / 1000 / 30) * 30 * 1000;
        const timeDiff = nextTime - Date.now();
        // console.log(timeDiff);
        if(timeDiff < 800 || timeDiff > 29200) {
          CodeGenerate.totpCode(6, localHmacKey, 30, Date.now()).then((_code) => {
            setCode(
              _code
            );
          });
        }
      }, 500);
      setIntervals(_interval);
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
              code={memoCode} 
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
                  window.open(`https://totp.wuliaomj.com/check?username=${username}`);
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
