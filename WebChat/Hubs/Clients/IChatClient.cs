using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebChat.Model;

namespace WebChat.Hubs.Clients
{
    public interface IChatClient
    {
        Task SendToAll(string user, string message, string timeStamp);

        Task SendToUser(MessageModel message);

        Task AddUserToGroup(string groupName);

        Task RemoveUserFromGroup(string groupName);

        Task SendToGroup(MessageModel message);
    }
}
