using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebChat.Model
{
    public class MessageModel
    {
        public string Sender { get; set; }

        public string Reciever { get; set; }

        public string Message { get; set; }
        public string TimeStamp { get; set; }
    }
}
