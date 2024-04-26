while true do
    local ws
    while not ws do
        local err
        ws, err = http.websocket("ws://localhost:4042")
        if (err) then
            print("Error connecting to controller, retrying: " .. err)
            sleep(5)
        end
    end

    print("Connected!")

    function responder_loop()
        -- c = contact
        ws.send("c:" .. tostring(os.computerLabel()))
        while true do
            local query = ws.receive(15)
            if not query then
                break
            end

            local type = string.sub(query, 1, 1)
            local value = string.sub(query, 3)

            -- e = execute
            if type == "e" then
                local func, err = load(value)
                if func then
                    local ok, rv = pcall(func)
                    if ok then
                        -- s = success
                        ws.send("s:" .. textutils.serializeJSON(rv))
                    else
                        -- e = error
                        ws.send("e:" .. rv)
                    end
                else
                    ws.send("e:" .. err)
                end
            -- p = ping
            elseif type == "p" then
                -- q = ping reply
                ws.send("q:" .. value)
            end
        end
    end

    pcall(responder_loop)

    ws.close()

    print("Connection closed, reopening in 5 seconds...")
    sleep(5)
end