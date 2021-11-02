using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using WebChat.Hubs.Clients;
using WebChat.Model;
using System.Linq;

namespace WebChat.Hubs
{
    [Authorize]
    public class ChatHub : Hub<IChatClient>
    {
        public static ConcurrentDictionary<string, string> Connections = new();
        private readonly UserManager<IdentityUser> _userManager;
        public string Identity { get; set; }

        public ChatHub(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }
        public async Task SendAll(string message)
        {
            await Clients.All.SendToAll(Context.User.Identity.Name, message, DateTime.Now.ToString("t"));
        }

        public async Task SendPrivate(string receiver, string message)
        {
            var receiverUser = await _userManager.FindByNameAsync(receiver);
            if (receiverUser != null)
            {
                Connections.TryGetValue(receiver, out string toUserInConnect);
                if (!string.IsNullOrEmpty(toUserInConnect))
                {
                    var resultMessage = new MessageModel
                    {
                        Reciever = receiver,
                        Message = message,
                        Sender = Context.User.Identity.Name,
                        TimeStamp = DateTime.Now.ToString("t")
                    };

                    await Clients.Client(toUserInConnect).SendToUser(resultMessage);
                    await Clients.Caller.SendToUser(resultMessage);
                }
                else
                {
                    var messageNotify = new MessageModel
                    {
                        Message = $"User {receiver} does not online now. The recipient will receive your message when online",
                        Sender = "System",
                        TimeStamp = DateTime.Now.ToString("t")
                    };
                    await Clients.Caller.SendToUser(messageNotify);
                }
            }
            else
            {
                var messageNotify = new MessageModel
                {
                    Message = $"User {receiver} does not existed",
                    Sender = "System",
                    TimeStamp = DateTime.Now.ToString("t")
                };
                await Clients.Caller.SendToUser(messageNotify);
            }
        }

        public async Task AddToGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var user = Connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            var messageNotify = new MessageModel
            {
                Message = $"{Context.User.Identity.Name} has joined the group {groupName}.",
                Sender = "System",
                TimeStamp = DateTime.Now.ToString("t")
            };
            await Clients.Group(groupName).SendToGroup(messageNotify);
        }

        public async Task RemoveFromGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            var user = Connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            var messageNotify = new MessageModel
            {
                Message = $"{Context.User.Identity.Name} has left the group {groupName}.",
                Sender = "System",
                TimeStamp = DateTime.Now.ToString("t")
            };

            await Clients.Group(groupName).SendToGroup(messageNotify);
        }

        public async Task SendMessageToGroup(string groupName, string message)
        {
            var user = Connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            var messageToGroup = new MessageModel
            {
                Message = message,
                Sender = Context.User.Identity.Name,
                TimeStamp = DateTime.Now.ToString("t")
            };

            await Clients.Group(groupName).SendToGroup(messageToGroup);
        }

        public override Task OnConnectedAsync()
        {
            //add list user online
            var userName = Context.User.Identity.Name;
            var connectionId = Context.ConnectionId;
            Connections.AddOrUpdate(userName, connectionId, (key, oldValue) => connectionId);

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            //remove user offline
            var userName = Context.User.Identity.Name;
            Connections.TryRemove(userName, out _);

            Clients.All.SendToAll("System", $"User {userName} going to offline", DateTime.Now.ToString("t")).GetAwaiter().GetResult();

            return base.OnDisconnectedAsync(exception);
        }
    }
}
