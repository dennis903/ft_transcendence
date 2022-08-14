import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { emitSendDMMessage } from './Emit';
import { IDMRoom, IMessageResponse, IMessages } from '../../modules/Interfaces/chatInterface';
import { DMRoomInfo, MyInfo } from '../../modules/atoms';

const DMRoomStyleC = styled.div`
	min-height: 600px;
	max-height: 600px;
`;

const ChatLogStyleC = styled.ul`
	min-height: 400px;
	max-height: 400px;
	/* height: 100%; */
	overflow-wrap: break-word;
	overflow-y: scroll;
`;

const DMDivStyleC = styled.div`
	width: 100%;
	height: 80px;
	display: flex;
	border: none;
	margin: 0;
`;

const DMInputStyleC = styled.textarea`
	width: 80%;
	resize: none;
	font-family: 'Galmuri7', 'sans-serif';
`;

const DMButtonStyleC = styled.div`
	background-color: red;
	width: 20%;
`;

const ChatMessageStyleC = styled.li`
	margin: 3px;
`;

interface ISocket {
	chatSocket: Socket;
}

function DMRoom({ chatSocket }: ISocket) {
	const [message, setMessage] = useState('');
	const [roomInfo, setRoomInfo] = useRecoilState<IDMRoom>(DMRoomInfo);
	const [messageList, setMessageList] = useState<IMessages[]>([]);
	const Info = useRecoilValue(MyInfo);
	const messageBoxRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const scrollToBottom = (e: Event) => {
			e.stopPropagation();
			e.preventDefault();
			const target = e.currentTarget as HTMLUListElement;

			target.scroll({
				top: target.scrollHeight,
				// behavior: 'smooth',
			});
		};
		if (messageBoxRef.current) {
			messageBoxRef.current.addEventListener('DOMNodeInserted', scrollToBottom);
		}

		return () => {
			if (messageBoxRef.current) {
				messageBoxRef.current.removeEventListener('DOMNodeInserted', scrollToBottom);
			}
		};
	}, []);

	const sendMessage = () => {
		if (message.trim() !== '') {
			emitSendDMMessage(chatSocket, roomInfo.id, Info.id, message);
			// scrollToBottom();
		}
		const timer = setTimeout(() => {
			setMessage('');
			clearTimeout(timer);
		}, 0);
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter') {
			sendMessage();
		}
	};

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningDMRoomInfo', (response: { data: IDMRoom }) => {
				setRoomInfo(response.data);
				response.data.message?.map((element: IMessages) => {
					setMessageList((msgList) => {
						return [...msgList, element];
					});
					// scrollToBottom();
					return () => {};
				});
			});
			return () => {
				chatSocket.off('listeningDMRoomInfo');
			};
		}
		return () => {};
	}, [chatSocket]);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on('listeningDMMessage', (response: IMessageResponse) => {
				setMessageList((msg) => {
					return [...msg, response.data];
				});
				// scrollToBottom();
			});
			return () => {
				chatSocket.off('listeningDMMessage');
			};
		}
		return () => {};
	}, [chatSocket]);

	return (
		<DMRoomStyleC>
			<ChatLogStyleC ref={messageBoxRef}>
				{messageList?.map((msg: IMessages) => {
					return (
						<ChatMessageStyleC key={msg.id}>
							{msg.author.nickname} : {msg.content}
						</ChatMessageStyleC>
					);
				})}
			</ChatLogStyleC>
			<DMDivStyleC>
				<DMInputStyleC
					onKeyPress={(event) => handleKeyPress(event)}
					value={message}
					onChange={(event) => {
						setMessage(event.target.value);
					}}
				/>
				<DMButtonStyleC
					onClick={() => {
						sendMessage();
					}}
				/>
			</DMDivStyleC>
		</DMRoomStyleC>
	);
}

export default DMRoom;